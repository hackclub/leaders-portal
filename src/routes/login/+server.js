import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

export const GET = async ({ cookies }) => {
	const state = crypto.randomBytes(16).toString('base64url');

	cookies.set('oauth_state', state, {
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		path: '/',
		maxAge: 600
	});

	const authorizeUrl = new URL('https://dashboard.hackclub.com/oauth/authorize');
	authorizeUrl.searchParams.set('client_id', env.HACKCLUB_OAUTH_CLIENT_ID);
	authorizeUrl.searchParams.set('redirect_uri', env.OAUTH_REDIRECT_URI);
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('scope', env.OAUTH_SCOPES || '');
	authorizeUrl.searchParams.set('state', state);

	throw redirect(302, authorizeUrl.toString());
};
