import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

export const GET = async ({ cookies, locals }) => {
	if (!locals.userId) {
		throw redirect(302, '/email-login');
	}

	const state = crypto.randomBytes(32).toString('base64url');
	
	const stateData = JSON.stringify({ state, returnTo: '/settings', action: 'link' });
	
	cookies.set('oauth_state', stateData, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 600
	});

	const scopes = 'email name slack_id';
	const authUrl = new URL('https://auth.hackclub.com/oauth/authorize');
	authUrl.searchParams.set('client_id', env.HACKCLUB_AUTH_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', env.HACKCLUB_AUTH_REDIRECT_URI);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', scopes);
	authUrl.searchParams.set('state', state);

	throw redirect(302, authUrl.toString());
};
