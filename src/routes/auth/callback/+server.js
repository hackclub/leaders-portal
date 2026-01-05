import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { getKnex } from '$lib/server/db/knex.js';
import { createSession } from '$lib/server/auth/sessions.js';
import { checkLeaderClubStatus } from '$lib/server/clubapi.js';
import { sanitizeReturnTo } from '$lib/server/auth/utils.js';

export const GET = async ({ url, cookies, fetch, getClientAddress, request, locals }) => {
	const stateCookie = cookies.get('oauth_state');
	const stateParam = url.searchParams.get('state');
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	if (error) {
		console.error('OAuth error:', error, url.searchParams.get('error_description'));
		throw redirect(302, '/email-login?error=oauth_denied');
	}

	if (!stateCookie || !stateParam) {
		return new Response('Invalid OAuth state', { status: 400 });
	}

	let stateData;
	try {
		stateData = JSON.parse(stateCookie);
	} catch {
		return new Response('Invalid OAuth state format', { status: 400 });
	}

	if (stateData.state !== stateParam) {
		return new Response('OAuth state mismatch', { status: 400 });
	}

	if (!code) {
		return new Response('Missing authorization code', { status: 400 });
	}

	cookies.delete('oauth_state', { path: '/' });

	const tokenRes = await fetch('https://auth.hackclub.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: env.HACKCLUB_AUTH_CLIENT_ID,
			client_secret: env.HACKCLUB_AUTH_CLIENT_SECRET,
			redirect_uri: env.HACKCLUB_AUTH_REDIRECT_URI,
			code,
			grant_type: 'authorization_code'
		})
	});

	if (!tokenRes.ok) {
		console.error('Token exchange failed:', tokenRes.status, tokenRes.statusText);
		throw redirect(302, '/email-login?error=token_exchange_failed');
	}

	const tokenJson = await tokenRes.json();
	const accessToken = tokenJson.access_token;

	const userRes = await fetch('https://auth.hackclub.com/api/v1/me', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!userRes.ok) {
		console.error('User fetch failed:', userRes.status, userRes.statusText);
		throw redirect(302, '/email-login?error=user_fetch_failed');
	}

	const userData = await userRes.json();
	const identity = userData.identity;

	const hackclubAuthId = identity.id;
	const primaryEmail = identity.primary_email;
	const firstName = identity.first_name || null;
	const lastName = identity.last_name || null;
	const slackId = identity.slack_id || null;

	if (!primaryEmail) {
		throw redirect(302, '/email-login?error=no_email');
	}

	const knex = getKnex();
	const action = stateData.action || 'login';
	const returnTo = sanitizeReturnTo(stateData.returnTo);

	if (action === 'link') {
		const currentUserId = locals.userId;
		if (!currentUserId) {
			throw redirect(302, '/email-login?error=not_logged_in');
		}

		const existingLinked = await knex('users')
			.where({ hackclub_auth_id: hackclubAuthId })
			.whereNot({ id: currentUserId })
			.first();

		if (existingLinked) {
			throw redirect(302, '/settings?error=already_linked');
		}

		try {
			await knex('users')
				.where({ id: currentUserId })
				.update({
					hackclub_auth_id: hackclubAuthId,
					hackclub_primary_email: primaryEmail,
					hackclub_slack_id: slackId,
					updated_at: new Date()
				});
		} catch (err) {
			if (err.code === '23505') {
				throw redirect(302, '/settings?error=already_linked');
			}
			throw err;
		}

		throw redirect(302, '/settings?success=linked');
	}

	let user = await knex('users')
		.where({ hackclub_auth_id: hackclubAuthId })
		.first();

	if (!user) {
		user = await knex('users')
			.where({ email: primaryEmail })
			.first();

		if (user) {
			await knex('users')
				.where({ id: user.id })
				.update({
					hackclub_auth_id: hackclubAuthId,
					hackclub_primary_email: primaryEmail,
					hackclub_slack_id: slackId,
					updated_at: new Date()
				});
			user = await knex('users').where({ id: user.id }).first();
		}
	}

	if (!user) {
		const { isLeader, isDormant } = await checkLeaderClubStatus(primaryEmail);
		if (!isLeader) {
			throw redirect(302, '/email-login?error=not_a_leader');
		}
		if (isDormant) {
			throw redirect(302, '/email-login?error=club_dormant');
		}

		try {
			const [newUser] = await knex('users')
				.insert({
					id: crypto.randomUUID(),
					provider: 'hackclub_auth',
					provider_user_id: hackclubAuthId,
					email: primaryEmail,
					first_name: firstName,
					last_name: lastName,
					identity_verified: true,
					hackclub_auth_id: hackclubAuthId,
					hackclub_primary_email: primaryEmail,
					hackclub_slack_id: slackId
				})
				.returning('*');
			user = newUser;
		} catch (err) {
			if (err.code === '23505') {
				user = await knex('users')
					.where({ hackclub_auth_id: hackclubAuthId })
					.first();
				if (!user) {
					throw redirect(302, '/email-login?error=login_failed');
				}
			} else {
				throw err;
			}
		}
	} else {
		if (user.hackclub_auth_id !== hackclubAuthId) {
			try {
				await knex('users')
					.where({ id: user.id })
					.update({
						hackclub_auth_id: hackclubAuthId,
						hackclub_primary_email: primaryEmail,
						hackclub_slack_id: slackId,
						updated_at: new Date()
					});
			} catch (err) {
				if (err.code !== '23505') {
					throw err;
				}
			}
		}
	}

	const sessionToken = crypto.randomBytes(32).toString('base64url');
	await createSession(knex, user.id, sessionToken, {
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

	throw redirect(302, returnTo);
};
