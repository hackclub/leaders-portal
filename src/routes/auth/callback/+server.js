import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { getKnex } from '$lib/server/db/knex.js';
import { upsertUserFromProvider } from '$lib/server/auth/users.js';
import { storeTokens } from '$lib/server/auth/tokens.js';
import { createSession } from '$lib/server/auth/sessions.js';
import { syncUserClubs } from '$lib/server/auth/clubs.js';

export const GET = async ({ url, cookies, fetch, getClientAddress, request }) => {
	const stateCookie = cookies.get('oauth_state');
	const stateParam = url.searchParams.get('state');
	const code = url.searchParams.get('code');

	if (!stateCookie || !stateParam || stateCookie !== stateParam) {
		return new Response('Invalid OAuth state', { status: 400 });
	}

	if (!code) {
		return new Response('Missing authorization code', { status: 400 });
	}

	cookies.delete('oauth_state', { path: '/' });

	const tokenRes = await fetch('https://dashboard.hackclub.com/oauth/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: env.HACKCLUB_OAUTH_CLIENT_ID,
			client_secret: env.HACKCLUB_OAUTH_CLIENT_SECRET,
			code,
			redirect_uri: env.OAUTH_REDIRECT_URI
		})
	});

	if (!tokenRes.ok) {
		const errorText = await tokenRes.text();
		console.error('Token exchange failed:', errorText);
		return new Response('Token exchange failed', { status: 400 });
	}

	const tokenJson = await tokenRes.json();

	const userRes = await fetch('https://dashboard.hackclub.com/oauth/user', {
		headers: { authorization: `Bearer ${tokenJson.access_token}` }
	});

	if (!userRes.ok) {
		const errorText = await userRes.text();
		console.error('User fetch failed:', errorText);
		return new Response('User fetch failed', { status: 400 });
	}

	const { user } = await userRes.json();

	const knex = getKnex();
	const dbUser = await upsertUserFromProvider(knex, {
		provider_user_id: String(user.id),
		username: user.username ?? null,
		email: user.email ?? null,
		first_name: user.first_name ?? null,
		last_name: user.last_name ?? null,
		identity_verified: !!user.identity_verified
	});

	await storeTokens(knex, dbUser.id, {
		access_token: tokenJson.access_token,
		refresh_token: tokenJson.refresh_token,
		token_type: tokenJson.token_type,
		scope_requested: env.OAUTH_SCOPES || '',
		scope_granted: tokenJson.scope || null,
		access_token_expires_at: new Date(Date.now() + (tokenJson.expires_in ?? 3600) * 1000)
	});

	const clubsRes = await fetch('https://dashboard.hackclub.com/oauth/user/clubs', {
		headers: { authorization: `Bearer ${tokenJson.access_token}` }
	});

	if (clubsRes.ok) {
		const clubsData = await clubsRes.json();
		await syncUserClubs(knex, dbUser.id, clubsData);
	}

	const sessionToken = crypto.randomBytes(32).toString('base64url');
	await createSession(knex, dbUser.id, sessionToken, {
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent') ?? undefined
	});

	const fourteenDays = 14 * 24 * 60 * 60;
	cookies.set('sid', sessionToken, {
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		path: '/',
		maxAge: fourteenDays
	});

	throw redirect(302, '/');
};
