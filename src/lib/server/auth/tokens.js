import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { encrypt, decrypt } from './crypto.js';

export async function storeTokens(knex, userId, tokenData) {
	const encAccess = encrypt(tokenData.access_token);
	const encRefresh = encrypt(tokenData.refresh_token);

	const existing = await knex('oauth_tokens')
		.where({ user_id: userId, provider: 'hackclub' })
		.first();

	const data = {
		access_token_ciphertext: encAccess.ciphertext,
		access_token_iv: encAccess.iv,
		access_token_tag: encAccess.tag,
		refresh_token_ciphertext: encRefresh.ciphertext,
		refresh_token_iv: encRefresh.iv,
		refresh_token_tag: encRefresh.tag,
		token_type: tokenData.token_type ?? null,
		scope_requested: tokenData.scope_requested ?? null,
		scope_granted: tokenData.scope_granted ?? null,
		access_token_expires_at: tokenData.access_token_expires_at,
		updated_at: new Date()
	};

	if (existing) {
		await knex('oauth_tokens').where({ id: existing.id }).update(data);
	} else {
		await knex('oauth_tokens').insert({
			id: crypto.randomUUID(),
			user_id: userId,
			provider: 'hackclub',
			...data,
			created_at: new Date()
		});
	}
}

export async function refreshIfNeeded(knex, userId, fetch) {
	const row = await knex('oauth_tokens').where({ user_id: userId, provider: 'hackclub' }).first();
	if (!row) {
		throw new Error('No tokens found for user');
	}

	const accessToken = decrypt(row.access_token_ciphertext, row.access_token_iv, row.access_token_tag);
	const refreshToken = decrypt(
		row.refresh_token_ciphertext,
		row.refresh_token_iv,
		row.refresh_token_tag
	);

	const exp = new Date(row.access_token_expires_at).getTime();
	const now = Date.now();

	if (exp - now > 60_000) {
		return { token: accessToken, refreshed: false };
	}

	const res = await fetch('https://dashboard.hackclub.com/oauth/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: env.HACKCLUB_OAUTH_CLIENT_ID,
			client_secret: env.HACKCLUB_OAUTH_CLIENT_SECRET,
			refresh_token: refreshToken
		})
	});

	if (!res.ok) {
		await knex('oauth_tokens').where({ user_id: userId, provider: 'hackclub' }).del();
		throw new Error('Refresh failed - invalid grant');
	}

	const json = await res.json();
	const newAccessExp = new Date(Date.now() + (json.expires_in ?? 3600) * 1000);

	const encA = encrypt(json.access_token);
	const updates = {
		access_token_ciphertext: encA.ciphertext,
		access_token_iv: encA.iv,
		access_token_tag: encA.tag,
		access_token_expires_at: newAccessExp,
		token_type: json.token_type ?? null,
		scope_granted: json.scope ?? row.scope_granted,
		updated_at: new Date()
	};

	if (json.refresh_token) {
		const encR = encrypt(json.refresh_token);
		updates.refresh_token_ciphertext = encR.ciphertext;
		updates.refresh_token_iv = encR.iv;
		updates.refresh_token_tag = encR.tag;
	}

	await knex('oauth_tokens').where({ id: row.id }).update(updates);
	return { token: json.access_token, refreshed: true };
}
