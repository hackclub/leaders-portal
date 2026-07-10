import crypto from 'node:crypto';
import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { verifyOTP } from '$lib/server/auth/otp.js';
import { createSession } from '$lib/server/auth/sessions.js';
import { getClubsForLeader } from '$lib/server/airtable.js';
import { checkLeaderClubStatus } from '$lib/server/clubapi.js';
import {
	checkIpRateLimit,
	checkEmailRateLimit,
	recordIpAttempt,
	recordEmailAttempt,
	resetRateLimit
} from '$lib/server/rate-limit.js';

const SESSION_COOKIE = 'sid';

export async function POST({ request, cookies, getClientAddress }) {
	const ip = getClientAddress();

	const ipCheck = await checkIpRateLimit(ip, 'verify');
	if (!ipCheck.allowed) {
		const retryAfter = ipCheck.retryAfter || 1800;
		return json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': String(retryAfter) } }
		);
	}

	const { email, code } = await request.json();

	if (!email || !code) {
		return json({ error: 'Email and code are required' }, { status: 400 });
	}

	const emailCheck = await checkEmailRateLimit(email, 'verify');
	if (!emailCheck.allowed) {
		const retryAfter = emailCheck.retryAfter || 1800;
		return json(
			{ error: 'Too many verification attempts. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': String(retryAfter) } }
		);
	}

	const knex = getKnex();

	const isValid = await verifyOTP(knex, email, code);

	if (!isValid) {
		await recordIpAttempt(ip, 'verify');
		await recordEmailAttempt(email, 'verify');
		return json({ error: 'Invalid or expired OTP code' }, { status: 401 });
	}

	const { isLeader, isDormant } = await checkLeaderClubStatus(email);
	if (!isLeader) {
		return json({ error: 'You are not registered as a club leader' }, { status: 403 });
	}
	if (isDormant) {
		return json({ error: 'Your club is marked as Dormant. Please contact Hack Club HQ to reactivate your club.' }, { status: 403 });
	}

	await resetRateLimit(`verify:ip:${ip}`);
	await resetRateLimit(`verify:email:${email.toLowerCase()}`);
	await resetRateLimit(`request:ip:${ip}`);
	await resetRateLimit(`request:email:${email.toLowerCase()}`);

	let user = await knex('users')
		.where({ provider: 'email', provider_user_id: email })
		.first();

	if (!user) {
		const [newUser] = await knex('users')
			.insert({
				id: crypto.randomUUID(),
				provider: 'email',
				provider_user_id: email,
				email: email,
				identity_verified: true
			})
			.returning('*');
		user = newUser;
	}

	const clubs = await getClubsForLeader(email);

	const sessionToken = crypto.randomBytes(32).toString('base64url');
	await createSession(knex, user.id, sessionToken, {
		ip: getClientAddress(),
		userAgent: request.headers.get('user-agent')
	});

	cookies.set(SESSION_COOKIE, sessionToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 14
	});

	return json({ success: true, clubs });
}
