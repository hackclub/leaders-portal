import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { createOTP } from '$lib/server/auth/otp.js';
import { checkLeaderClubStatus } from '$lib/server/clubapi.js';
import { sendOTPEmail } from '$lib/server/email.js';
import {
	checkIpRateLimit,
	checkEmailRateLimit,
	recordIpAttempt,
	recordEmailAttempt
} from '$lib/server/rate-limit.js';

export async function POST({ request, getClientAddress }) {
	const ip = getClientAddress();

	const ipCheck = await checkIpRateLimit(ip, 'request');
	if (!ipCheck.allowed) {
		const retryAfter = ipCheck.retryAfter || 1800;
		return json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': String(retryAfter) } }
		);
	}

	const { email } = await request.json();

	if (!email) {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const emailCheck = await checkEmailRateLimit(email, 'request');
	if (!emailCheck.allowed) {
		const retryAfter = emailCheck.retryAfter || 1800;
		return json(
			{ error: 'Too many OTP requests for this email. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': String(retryAfter) } }
		);
	}

	await recordIpAttempt(ip, 'request');
	await recordEmailAttempt(email, 'request');

	const { isLeader, isDormant } = await checkLeaderClubStatus(email);

	if (isDormant) {
		return json({ error: 'Your club is marked as Dormant. Please contact Hack Club HQ to reactivate your club.' }, { status: 403 });
	}

	if (!isLeader) {
		return json({ error: 'You are not registered as a club leader. If this is a mistake, please contact us' }, { status: 403 });
	}

	const knex = getKnex();
	const code = await createOTP(knex, email);

	await sendOTPEmail(email, code);

	return json({ success: true });
}
