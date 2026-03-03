import { error } from '@sveltejs/kit';
import { findAccessTokenByRaw, touchAccessToken } from './store.js';
import { getSensitiveScopes, parseScopeString } from './scopes.js';

export function getBearerToken(request) {
	const authHeader = request.headers.get('authorization') || '';
	const [type, token] = authHeader.split(' ');
	if (!type || type.toLowerCase() !== 'bearer' || !token) {
		return null;
	}
	return token;
}

export function hasRequiredScopes(grantedScopes, requiredScopes) {
	const granted = new Set(grantedScopes || []);
	for (const scope of requiredScopes || []) {
		if (!granted.has(scope)) {
			return false;
		}
	}
	return true;
}

export async function requireOAuthAccess(knex, request, requiredScopes = []) {
	const rawToken = getBearerToken(request);
	if (!rawToken) {
		throw error(401, 'Missing bearer token');
	}

	const tokenRow = await findAccessTokenByRaw(knex, rawToken);
	if (!tokenRow) {
		throw error(401, 'Invalid or expired access token');
	}

	const grantedScopes = parseScopeString(tokenRow.scopes);
	if (!hasRequiredScopes(grantedScopes, requiredScopes)) {
		throw error(403, 'Insufficient scope');
	}

	const sensitiveScopes = getSensitiveScopes(grantedScopes);
	if (sensitiveScopes.length > 0 && !tokenRow.application_verified) {
		throw error(403, 'Sensitive scopes require a verified application');
	}

	await touchAccessToken(knex, tokenRow.token_id);

	return {
		tokenId: tokenRow.token_id,
		application: {
			id: tokenRow.application_id,
			clientId: tokenRow.client_id,
			name: tokenRow.application_name,
			verified: tokenRow.application_verified
		},
		user: {
			id: tokenRow.user_id,
			email: tokenRow.email,
			firstName: tokenRow.first_name,
			lastName: tokenRow.last_name,
			identityVerified: tokenRow.identity_verified,
			hackclubPrimaryEmail: tokenRow.hackclub_primary_email,
			hackclubSlackId: tokenRow.hackclub_slack_id,
			provider: tokenRow.provider
		},
		scopes: grantedScopes
	};
}
