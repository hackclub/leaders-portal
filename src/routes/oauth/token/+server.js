import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import {
	consumeAuthorizationCode,
	findOAuthApplicationByClientId,
	issueAccessToken,
	rotateAccessTokenFromRefresh,
	verifyClientSecret
} from '$lib/server/oauth/store.js';
import { stringifyScopes } from '$lib/server/oauth/scopes.js';

function noStoreHeaders() {
	return {
		'Cache-Control': 'no-store',
		Pragma: 'no-cache'
	};
}

function oauthError(code, description, status = 400) {
	return json(
		{
			error: code,
			error_description: description
		},
		{
			status,
			headers: noStoreHeaders()
		}
	);
}

function parseBasicAuth(request) {
	const authHeader = request.headers.get('authorization') || '';
	const [type, value] = authHeader.split(' ');
	if (!type || type.toLowerCase() !== 'basic' || !value) {
		return null;
	}

	try {
		const decoded = Buffer.from(value, 'base64').toString('utf8');
		const separator = decoded.indexOf(':');
		if (separator === -1) return null;
		return {
			clientId: decoded.slice(0, separator),
			clientSecret: decoded.slice(separator + 1)
		};
	} catch {
		return null;
	}
}

export async function POST({ request }) {
	const contentType = request.headers.get('content-type') || '';
	if (!contentType.includes('application/x-www-form-urlencoded')) {
		return oauthError('invalid_request', 'Token endpoint expects application/x-www-form-urlencoded');
	}

	const body = await request.formData();
	const grantType = body.get('grant_type')?.toString();
	const basicAuth = parseBasicAuth(request);
	const clientId = basicAuth?.clientId || body.get('client_id')?.toString();
	const clientSecret = basicAuth?.clientSecret || body.get('client_secret')?.toString() || '';

	if (!clientId) {
		return oauthError('invalid_client', 'Missing client authentication', 401);
	}

	const knex = getKnex();
	const app = await findOAuthApplicationByClientId(knex, clientId);
	if (!app) {
		return oauthError('invalid_client', 'Unknown client_id', 401);
	}

	if (!verifyClientSecret(app, clientSecret)) {
		return oauthError('invalid_client', 'Invalid client credentials', 401);
	}

	if (grantType === 'authorization_code') {
		const code = body.get('code')?.toString();
		const redirectUri = body.get('redirect_uri')?.toString();

		if (!code || !redirectUri) {
			return oauthError('invalid_request', 'Missing code or redirect_uri');
		}

		const authCode = await consumeAuthorizationCode(knex, {
			applicationId: app.id,
			code,
			redirectUri
		});

		if (!authCode) {
			return oauthError('invalid_grant', 'Authorization code is invalid, expired, or already used');
		}

		const scopeList = authCode.scopes.split(' ').filter(Boolean);
		const token = await issueAccessToken(knex, {
			applicationId: app.id,
			userId: authCode.user_id,
			scopes: scopeList
		});

		return json(
			{
				access_token: token.accessToken,
				token_type: 'Bearer',
				expires_in: token.expiresIn,
				refresh_token: token.refreshToken,
				scope: stringifyScopes(scopeList)
			},
			{ headers: noStoreHeaders() }
		);
	}

	if (grantType === 'refresh_token') {
		const refreshToken = body.get('refresh_token')?.toString();
		if (!refreshToken) {
			return oauthError('invalid_request', 'Missing refresh_token');
		}

		const next = await rotateAccessTokenFromRefresh(knex, {
			applicationId: app.id,
			refreshToken
		});
		if (!next) {
			return oauthError('invalid_grant', 'Refresh token is invalid or revoked');
		}

		return json(
			{
				access_token: next.accessToken,
				token_type: 'Bearer',
				expires_in: next.expiresIn,
				refresh_token: next.refreshToken,
				scope: stringifyScopes(next.scopes)
			},
			{ headers: noStoreHeaders() }
		);
	}

	return oauthError('unsupported_grant_type', 'Only authorization_code and refresh_token are supported');
}
