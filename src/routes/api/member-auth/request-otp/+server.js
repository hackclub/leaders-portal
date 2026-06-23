import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { createOTP } from '$lib/server/auth/otp.js';
import { checkMemberEmail } from '$lib/server/airtable.js';
import { sendOTPEmail } from '$lib/server/email.js';
import {
	checkIpRateLimit,
	checkEmailRateLimit,
	recordIpAttempt,
	recordEmailAttempt
} from '$lib/server/rate-limit.js';

export async function POST({ request, getClientAddress }) {
	const ip = getClientAddress();

	const ipCheck = await checkIpRateLimit(ip);
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

	const emailCheck = await checkEmailRateLimit(email);
	if (!emailCheck.allowed) {
		const retryAfter = emailCheck.retryAfter || 1800;
		return json(
			{ error: 'Too many OTP requests for this email. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': String(retryAfter) } }
		);
	}

	await recordIpAttempt(ip);
	await recordEmailAttempt(email);

	const { isMember } = await checkMemberEmail(email);

	if (!isMember) {
		return json({ error: 'You are not registered as a club member. If this is a mistake, please contact your club leader.' }, { status: 403 });
	}

	const knex = getKnex();
	const code = await createOTP(knex, email);

	await sendOTPEmail(email, code);

	return json({ success: true });
}
