import { error, fail, redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import {
	findOAuthApplicationByClientId,
	issueAuthorizationCode,
	isRedirectUriAllowed,
	parseApplicationScopes
} from '$lib/server/oauth/store.js';
import {
	DEFAULT_OAUTH_SCOPES,
	OAUTH_SCOPES,
	getSensitiveScopes,
	getUnknownScopes,
	normalizeRequestedScopes
} from '$lib/server/oauth/scopes.js';

function buildRedirectWithParams(redirectUri, params) {
	const url = new URL(redirectUri);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			url.searchParams.set(key, value);
		}
	}
	return url.toString();
}

function mapScopeMeta(scopes) {
	return scopes.map((scopeName) => {
		const scope = OAUTH_SCOPES.find((item) => item.name === scopeName);
		return {
			name: scopeName,
			description: scope?.description || scopeName,
			sensitive: !!scope?.sensitive
		};
	});
}

async function parseAndValidateAuthorizeRequest(knex, url) {
	const clientId = url.searchParams.get('client_id')?.trim();
	const redirectUri = url.searchParams.get('redirect_uri')?.trim();
	const responseType = url.searchParams.get('response_type')?.trim();
	const state = url.searchParams.get('state')?.trim() || '';
	const scope = url.searchParams.get('scope') || '';

	if (!clientId) {
		throw error(400, 'Missing client_id');
	}
	if (!redirectUri) {
		throw error(400, 'Missing redirect_uri');
	}

	const app = await findOAuthApplicationByClientId(knex, clientId);
	if (!app) {
		throw error(400, 'Unknown client_id');
	}
	if (!isRedirectUriAllowed(app, redirectUri)) {
		throw error(400, 'Invalid redirect_uri');
	}
	if (responseType !== 'code') {
		throw redirect(
			302,
			buildRedirectWithParams(redirectUri, {
				error: 'unsupported_response_type',
				error_description: 'Only response_type=code is supported',
				state
			})
		);
	}

	const requestedScopes = normalizeRequestedScopes(scope);
	const unknownScopes = getUnknownScopes(requestedScopes);
	if (unknownScopes.length > 0) {
		throw redirect(
			302,
			buildRedirectWithParams(redirectUri, {
				error: 'invalid_scope',
				error_description: `Unknown scopes: ${unknownScopes.join(', ')}`,
				state
			})
		);
	}

	const appScopes = parseApplicationScopes(app.scopes);
	const unauthorizedScopes = requestedScopes.filter((requested) => !appScopes.includes(requested));
	if (unauthorizedScopes.length > 0) {
		throw redirect(
			302,
			buildRedirectWithParams(redirectUri, {
				error: 'invalid_scope',
				error_description: `Application is not configured for scopes: ${unauthorizedScopes.join(', ')}`,
				state
			})
		);
	}

	const sensitiveScopes = getSensitiveScopes(requestedScopes);

	return {
		clientId,
		redirectUri,
		responseType,
		state,
		requestedScopes,
		sensitiveScopes,
		app
	};
}

export async function load({ locals, url }) {
	if (!locals.userId) {
		const returnTo = `${url.pathname}${url.search}`;
		throw redirect(302, `/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
	}

	const knex = getKnex();
	const requestData = await parseAndValidateAuthorizeRequest(knex, url);
	const blockedByVerification = requestData.sensitiveScopes.length > 0 && !requestData.app.verified;

	return {
		request: {
			clientId: requestData.clientId,
			redirectUri: requestData.redirectUri,
			responseType: requestData.responseType,
			state: requestData.state,
			scope: requestData.requestedScopes.join(' ')
		},
		app: {
			name: requestData.app.name,
			description: requestData.app.description,
			verified: requestData.app.verified
		},
		scopes: mapScopeMeta(requestData.requestedScopes),
		sensitiveScopes: requestData.sensitiveScopes,
		blockedByVerification,
		defaultScopes: DEFAULT_OAUTH_SCOPES
	};
}

export const actions = {
	approve: async ({ request, locals }) => {
		if (!locals.userId) {
			throw redirect(302, '/email-login');
		}

		const formData = await request.formData();
		const clientId = formData.get('client_id')?.toString();
		const redirectUri = formData.get('redirect_uri')?.toString();
		const responseType = formData.get('response_type')?.toString();
		const state = formData.get('state')?.toString() || '';
		const scopeString = formData.get('scope')?.toString() || '';

		if (!clientId || !redirectUri || responseType !== 'code') {
			return fail(400, { authorizeError: 'Malformed authorization request' });
		}

		const knex = getKnex();
		const requestUrl = new URL('http://oauth.local/authorize');
		requestUrl.searchParams.set('client_id', clientId);
		requestUrl.searchParams.set('redirect_uri', redirectUri);
		requestUrl.searchParams.set('response_type', responseType);
		requestUrl.searchParams.set('scope', scopeString);
		if (state) requestUrl.searchParams.set('state', state);

		const requestData = await parseAndValidateAuthorizeRequest(knex, requestUrl);
		const blockedByVerification = requestData.sensitiveScopes.length > 0 && !requestData.app.verified;

		if (blockedByVerification) {
			throw redirect(
				302,
				buildRedirectWithParams(redirectUri, {
					error: 'invalid_scope',
					error_description: 'This app must be verified before it can request sensitive scopes',
					state
				})
			);
		}

		const code = await issueAuthorizationCode(knex, {
			applicationId: requestData.app.id,
			userId: locals.userId,
			redirectUri,
			scopes: requestData.requestedScopes
		});

		throw redirect(
			302,
			buildRedirectWithParams(redirectUri, {
				code,
				state
			})
		);
	},

	deny: async ({ request }) => {
		const formData = await request.formData();
		const redirectUri = formData.get('redirect_uri')?.toString();
		const state = formData.get('state')?.toString() || '';

		if (!redirectUri) {
			return fail(400, { authorizeError: 'Missing redirect_uri' });
		}

		throw redirect(
			302,
			buildRedirectWithParams(redirectUri, {
				error: 'access_denied',
				error_description: 'The user denied this authorization request',
				state
			})
		);
	}
};
