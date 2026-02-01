import { error, fail } from '@sveltejs/kit';
import { getMemberByCode, deleteMember } from '$lib/server/clubapi.js';
import { getKnex } from '$lib/server/db/knex.js';
import { createOTP, verifyOTP } from '$lib/server/auth/otp.js';
import { sendLeaveVerificationEmail } from '$lib/server/email.js';
import { checkEmailRateLimit, recordEmailAttempt, checkIpRateLimit, recordIpAttempt } from '$lib/server/rate-limit.js';

export async function load({ params }) {
	const { code } = params;
	const member = await getMemberByCode(code);
	
	if (!member || member.error) {
		throw error(404, 'Member not found');
	}
	
	return {
		code,
		memberName: member.name,
		clubName: Array.isArray(member.club_name) ? member.club_name[0] : member.club_name,
		maskedEmail: member.email ? maskEmail(member.email) : null,
		hasEmail: !!member.email
	};
}

function maskEmail(email) {
	if (!email || !email.includes('@')) return null;
	const [local, domain] = email.split('@');
	const maskedLocal = local.slice(0, 2) + '*'.repeat(Math.max(local.length - 2, 3));
	return `${maskedLocal}@${domain}`;
}

export const actions = {
	requestVerification: async ({ params, request, getClientAddress }) => {
		const ip = getClientAddress();
		
		const ipCheck = await checkIpRateLimit(ip);
		if (!ipCheck.allowed) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}
		
		const { code } = params;
		const member = await getMemberByCode(code);
		
		if (!member || member.error) {
			return fail(404, { error: 'Member not found' });
		}
		
		if (!member.email) {
			return fail(400, { error: 'No email associated with this membership. Please contact club leadership.' });
		}
		
		const emailCheck = await checkEmailRateLimit(member.email);
		if (!emailCheck.allowed) {
			return fail(429, { error: 'Too many verification requests. Please try again later.' });
		}
		
		await recordIpAttempt(ip);
		await recordEmailAttempt(member.email);
		
		try {
			const knex = getKnex();
			const otpCode = await createOTP(knex, member.email);
			const clubName = Array.isArray(member.club_name) ? member.club_name[0] : member.club_name;
			
			await sendLeaveVerificationEmail(member.email, otpCode, member.name, clubName);
			
			return { verificationSent: true };
		} catch (err) {
			console.error('[Leave] Error sending verification:', err);
			return fail(500, { error: 'Failed to send verification code' });
		}
	},
	
	confirmLeave: async ({ params, request, getClientAddress }) => {
		const ip = getClientAddress();
		
		const ipCheck = await checkIpRateLimit(ip);
		if (!ipCheck.allowed) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}
		
		const formData = await request.formData();
		const verificationCode = formData.get('verificationCode')?.toString().trim();
		
		if (!verificationCode || verificationCode.length !== 6) {
			return fail(400, { error: 'Please enter a valid 6-digit verification code' });
		}
		
		const { code } = params;
		const member = await getMemberByCode(code);
		
		if (!member || member.error) {
			return fail(404, { error: 'Member not found' });
		}
		
		if (!member.email) {
			return fail(400, { error: 'No email associated with this membership' });
		}
		
		await recordIpAttempt(ip);
		
		try {
			const knex = getKnex();
			
			const isValid = await verifyOTP(knex, member.email, verificationCode);
			
			if (!isValid) {
				return fail(401, { error: 'Invalid or expired verification code' });
			}
			
			const clubName = Array.isArray(member.club_name) ? member.club_name[0] : member.club_name;
			await deleteMember(member.name, clubName);
			
			return { success: true };
		} catch (err) {
			console.error('[Leave] Error confirming leave:', err);
			return fail(500, { error: 'Failed to leave club' });
		}
	}
};
