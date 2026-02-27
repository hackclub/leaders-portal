import crypto from 'node:crypto';
import { parseScopeString, stringifyScopes } from './scopes.js';

const AUTH_CODE_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

export function hashValue(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

function safeCompareHex(left, right) {
	if (typeof left !== 'string' || typeof right !== 'string') return false;
	const leftBuffer = Buffer.from(left, 'hex');
	const rightBuffer = Buffer.from(right, 'hex');
	if (leftBuffer.length !== rightBuffer.length) return false;
	return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function generateClientId() {
	return `lp_${crypto.randomBytes(24).toString('base64url')}`;
}

export function generateClientSecret() {
	return `lps_${crypto.randomBytes(32).toString('base64url')}`;
}

export function parseStoredRedirectUris(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return parsed;
		} catch {
			return [];
		}
	}
	return [];
}

export function normalizeRedirectUris(value) {
	let uris = [];

	if (Array.isArray(value)) {
		uris = value;
	} else if (typeof value === 'string') {
		uris = value
			.split(/\r?\n|,/)
			.map((part) => part.trim())
			.filter(Boolean);
	}

	const normalized = [...new Set(uris.map((uri) => uri.trim()).filter(Boolean))];

	for (const uri of normalized) {
		let parsed;
		try {
			parsed = new URL(uri);
		} catch {
			throw new Error(`Invalid redirect URI: ${uri}`);
		}

		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			throw new Error(`Redirect URI must use http or https: ${uri}`);
		}
	}

	if (normalized.length === 0) {
		throw new Error('At least one redirect URI is required');
	}

	return normalized;
}

export function parseApplicationScopes(value) {
	return parseScopeString(value || '');
}

export function isRedirectUriAllowed(application, redirectUri) {
	const allowed = parseStoredRedirectUris(application.redirect_uris);
	return allowed.includes(redirectUri);
}

export function verifyClientSecret(application, clientSecret) {
	if (!application.confidential) return true;
	if (!clientSecret) return false;
	if (!application.client_secret_hash) return false;
	return safeCompareHex(hashValue(clientSecret), application.client_secret_hash);
}

export async function listOAuthApplicationsForOwner(knex, ownerUserId) {
	return knex('oauth_applications')
		.where({ owner_user_id: ownerUserId })
		.orderBy('created_at', 'desc');
}

export async function listOAuthApplications(knex) {
	return knex('oauth_applications')
		.orderBy('created_at', 'desc');
}

export async function findOAuthApplicationById(knex, id) {
	return knex('oauth_applications').where({ id }).first();
}

export async function findOAuthApplicationByClientId(knex, clientId) {
	return knex('oauth_applications').where({ client_id: clientId }).first();
}

export async function createOAuthApplication(knex, input) {
	const now = new Date();
	const clientId = generateClientId();
	const clientSecret = input.confidential ? generateClientSecret() : null;
	const redirectUris = normalizeRedirectUris(input.redirectUris);
	const scopes = stringifyScopes(input.scopes || []);

	const [row] = await knex('oauth_applications')
		.insert({
			id: crypto.randomUUID(),
			owner_user_id: input.ownerUserId,
			name: input.name,
			description: input.description || null,
			client_id: clientId,
			client_secret_hash: clientSecret ? hashValue(clientSecret) : null,
			redirect_uris: JSON.stringify(redirectUris),
			scopes,
			confidential: input.confidential !== false,
			verified: false,
			created_at: now,
			updated_at: now
		})
		.returning('*');

	return {
		row,
		clientSecret
	};
}

export async function updateOAuthApplicationByOwner(knex, input) {
	const redirectUris = normalizeRedirectUris(input.redirectUris);
	const scopes = stringifyScopes(input.scopes || []);
	const updates = {
		name: input.name,
		description: input.description || null,
		redirect_uris: JSON.stringify(redirectUris),
		scopes,
		confidential: input.confidential !== false,
		updated_at: new Date()
	};

	const [row] = await knex('oauth_applications')
		.where({ id: input.applicationId, owner_user_id: input.ownerUserId })
		.update(updates)
		.returning('*');

	return row || null;
}

export async function rotateOAuthApplicationSecret(knex, input) {
	const secret = generateClientSecret();
	const [row] = await knex('oauth_applications')
		.where({ id: input.applicationId, owner_user_id: input.ownerUserId })
		.andWhere({ confidential: true })
		.update({
			client_secret_hash: hashValue(secret),
			updated_at: new Date()
		})
		.returning('*');

	if (!row) return null;
	return { row, clientSecret: secret };
}

export async function deleteOAuthApplicationByOwner(knex, input) {
	return knex('oauth_applications')
		.where({ id: input.applicationId, owner_user_id: input.ownerUserId })
		.del();
}

export async function setOAuthApplicationVerified(knex, input) {
	const [row] = await knex('oauth_applications')
		.where({ id: input.applicationId })
		.update({
			verified: !!input.verified,
			updated_at: new Date()
		})
		.returning('*');

	return row || null;
}

export async function issueAuthorizationCode(knex, input) {
	const rawCode = crypto.randomBytes(32).toString('base64url');
	await knex('oauth_authorization_codes').insert({
		id: crypto.randomUUID(),
		application_id: input.applicationId,
		user_id: input.userId,
		code_hash: hashValue(rawCode),
		redirect_uri: input.redirectUri,
		scopes: stringifyScopes(input.scopes || []),
		expires_at: new Date(Date.now() + (input.ttlSeconds || AUTH_CODE_TTL_SECONDS) * 1000),
		used_at: null,
		created_at: new Date()
	});

	return rawCode;
}

export async function consumeAuthorizationCode(knex, input) {
	const codeHash = hashValue(input.code);

	return knex.transaction(async (trx) => {
		const row = await trx('oauth_authorization_codes')
			.where({ code_hash: codeHash, application_id: input.applicationId, redirect_uri: input.redirectUri })
			.whereNull('used_at')
			.andWhere('expires_at', '>', trx.fn.now())
			.first()
			.forUpdate();

		if (!row) {
			return null;
		}

		await trx('oauth_authorization_codes')
			.where({ id: row.id })
			.update({ used_at: new Date() });

		return row;
	});
}

export async function issueAccessToken(knex, input) {
	const rawAccessToken = crypto.randomBytes(32).toString('base64url');
	const rawRefreshToken = crypto.randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + (input.ttlSeconds || ACCESS_TOKEN_TTL_SECONDS) * 1000);

	await knex('oauth_access_tokens').insert({
		id: crypto.randomUUID(),
		application_id: input.applicationId,
		user_id: input.userId,
		token_hash: hashValue(rawAccessToken),
		refresh_token_hash: hashValue(rawRefreshToken),
		scopes: stringifyScopes(input.scopes || []),
		expires_at: expiresAt,
		revoked_at: null,
		last_used_at: null,
		created_at: new Date()
	});

	return {
		accessToken: rawAccessToken,
		refreshToken: rawRefreshToken,
		expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
	};
}

export async function rotateAccessTokenFromRefresh(knex, input) {
	const refreshHash = hashValue(input.refreshToken);

	return knex.transaction(async (trx) => {
		const existing = await trx('oauth_access_tokens')
			.where({
				refresh_token_hash: refreshHash,
				application_id: input.applicationId
			})
			.whereNull('revoked_at')
			.first()
			.forUpdate();

		if (!existing) {
			return null;
		}

		await trx('oauth_access_tokens')
			.where({ id: existing.id })
			.update({ revoked_at: new Date() });

		const next = await issueAccessToken(trx, {
			applicationId: existing.application_id,
			userId: existing.user_id,
			scopes: parseScopeString(existing.scopes),
			ttlSeconds: input.ttlSeconds || ACCESS_TOKEN_TTL_SECONDS
		});

		return {
			...next,
			scopes: parseScopeString(existing.scopes),
			userId: existing.user_id
		};
	});
}

export async function findAccessTokenByRaw(knex, rawAccessToken) {
	const tokenHash = hashValue(rawAccessToken);

	return knex('oauth_access_tokens as token')
		.join('oauth_applications as app', 'app.id', 'token.application_id')
		.join('users as user', 'user.id', 'token.user_id')
		.where('token.token_hash', tokenHash)
		.whereNull('token.revoked_at')
		.andWhere('token.expires_at', '>', knex.fn.now())
		.select(
			'token.id as token_id',
			'token.application_id',
			'token.user_id',
			'token.scopes',
			'token.expires_at',
			'app.client_id',
			'app.name as application_name',
			'app.verified as application_verified',
			'user.id as user_id_value',
			'user.email',
			'user.first_name',
			'user.last_name',
			'user.identity_verified',
			'user.hackclub_primary_email',
			'user.hackclub_slack_id',
			'user.provider'
		)
		.first();
}

export async function touchAccessToken(knex, tokenId) {
	await knex('oauth_access_tokens').where({ id: tokenId }).update({ last_used_at: new Date() });
}
