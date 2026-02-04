import { getKnex } from '$lib/server/db/knex.js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_IP = 10;
const MAX_ATTEMPTS_EMAIL = 5;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

// Email sending rate limits
const EMAIL_SEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_EMAILS_PER_HOUR_USER = 20; // Max emails a user can send per hour
const MAX_EMAILS_PER_HOUR_RECIPIENT = 3; // Max emails to the same recipient per hour

// Bulk email blast rate limits (announcements, events)
const BLAST_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_BLASTS_PER_HOUR = 3; // Max bulk email blasts per hour per user
const BLAST_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute cooldown between blasts

export async function checkRateLimit(key, maxAttempts) {
	const knex = getKnex();
	const now = new Date();

	const record = await knex('rate_limits').where({ key }).first();

	if (!record) {
		return { allowed: true, remaining: maxAttempts - 1 };
	}

	if (record.blocked_until && new Date(record.blocked_until) > now) {
		const retryAfter = Math.ceil((new Date(record.blocked_until) - now) / 1000);
		return { allowed: false, blocked: true, retryAfter };
	}

	const windowStart = new Date(record.window_start);
	const windowExpired = now - windowStart > WINDOW_MS;

	if (windowExpired) {
		return { allowed: true, remaining: maxAttempts - 1 };
	}

	if (record.attempts >= maxAttempts) {
		return { allowed: false, blocked: false, remaining: 0 };
	}

	return { allowed: true, remaining: maxAttempts - record.attempts - 1 };
}

export async function recordAttempt(key, maxAttempts) {
	const knex = getKnex();
	const now = new Date();

	const record = await knex('rate_limits').where({ key }).first();

	if (!record) {
		await knex('rate_limits').insert({
			key,
			attempts: 1,
			window_start: now,
			updated_at: now
		});
		return { blocked: false };
	}

	const windowStart = new Date(record.window_start);
	const windowExpired = now - windowStart > WINDOW_MS;

	if (windowExpired) {
		await knex('rate_limits').where({ key }).update({
			attempts: 1,
			window_start: now,
			blocked_until: null,
			updated_at: now
		});
		return { blocked: false };
	}

	const newAttempts = record.attempts + 1;

	if (newAttempts >= maxAttempts) {
		const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
		await knex('rate_limits').where({ key }).update({
			attempts: newAttempts,
			blocked_until: blockedUntil,
			updated_at: now
		});
		return { blocked: true, blockedUntil };
	}

	await knex('rate_limits').where({ key }).update({
		attempts: newAttempts,
		updated_at: now
	});

	return { blocked: false };
}

export async function checkIpRateLimit(ip) {
	const key = `ip:${ip}`;
	return checkRateLimit(key, MAX_ATTEMPTS_IP);
}

export async function recordIpAttempt(ip) {
	const key = `ip:${ip}`;
	return recordAttempt(key, MAX_ATTEMPTS_IP);
}

export async function checkEmailRateLimit(email) {
	const key = `email:${email.toLowerCase()}`;
	return checkRateLimit(key, MAX_ATTEMPTS_EMAIL);
}

export async function recordEmailAttempt(email) {
	const key = `email:${email.toLowerCase()}`;
	return recordAttempt(key, MAX_ATTEMPTS_EMAIL);
}

export async function resetRateLimit(key) {
	const knex = getKnex();
	await knex('rate_limits').where({ key }).del();
}

export async function cleanupExpiredRateLimits() {
	const knex = getKnex();
	const cutoff = new Date(Date.now() - WINDOW_MS * 2);
	await knex('rate_limits').where('updated_at', '<', cutoff).del();
}

// Email sending rate limits
export async function checkEmailSendRateLimit(senderEmail, recipientEmail) {
	const senderKey = `email_send:${senderEmail.toLowerCase()}`;
	const recipientKey = `email_recv:${recipientEmail.toLowerCase()}`;
	
	// Check sender's hourly limit
	const senderCheck = await checkRateLimitWithWindow(senderKey, MAX_EMAILS_PER_HOUR_USER, EMAIL_SEND_WINDOW_MS);
	if (!senderCheck.allowed) {
		return { 
			allowed: false, 
			reason: 'sender_limit',
			message: `You've sent too many emails. Please wait before sending more.`,
			retryAfter: senderCheck.retryAfter
		};
	}
	
	// Check recipient's hourly limit (prevent spamming one person)
	const recipientCheck = await checkRateLimitWithWindow(recipientKey, MAX_EMAILS_PER_HOUR_RECIPIENT, EMAIL_SEND_WINDOW_MS);
	if (!recipientCheck.allowed) {
		return { 
			allowed: false, 
			reason: 'recipient_limit',
			message: `This person has received too many emails recently. Please try again later.`,
			retryAfter: recipientCheck.retryAfter
		};
	}
	
	return { allowed: true };
}

export async function recordEmailSent(senderEmail, recipientEmail) {
	const senderKey = `email_send:${senderEmail.toLowerCase()}`;
	const recipientKey = `email_recv:${recipientEmail.toLowerCase()}`;
	
	await recordAttemptWithWindow(senderKey, MAX_EMAILS_PER_HOUR_USER, EMAIL_SEND_WINDOW_MS);
	await recordAttemptWithWindow(recipientKey, MAX_EMAILS_PER_HOUR_RECIPIENT, EMAIL_SEND_WINDOW_MS);
}

async function checkRateLimitWithWindow(key, maxAttempts, windowMs) {
	const knex = getKnex();
	const now = new Date();

	const record = await knex('rate_limits').where({ key }).first();

	if (!record) {
		return { allowed: true, remaining: maxAttempts - 1 };
	}

	if (record.blocked_until && new Date(record.blocked_until) > now) {
		const retryAfter = Math.ceil((new Date(record.blocked_until) - now) / 1000);
		return { allowed: false, blocked: true, retryAfter };
	}

	const windowStart = new Date(record.window_start);
	const windowExpired = now - windowStart > windowMs;

	if (windowExpired) {
		return { allowed: true, remaining: maxAttempts - 1 };
	}

	if (record.attempts >= maxAttempts) {
		const retryAfter = Math.ceil((windowMs - (now - windowStart)) / 1000);
		return { allowed: false, blocked: false, remaining: 0, retryAfter };
	}

	return { allowed: true, remaining: maxAttempts - record.attempts - 1 };
}

async function recordAttemptWithWindow(key, maxAttempts, windowMs) {
	const knex = getKnex();
	const now = new Date();

	const record = await knex('rate_limits').where({ key }).first();

	if (!record) {
		await knex('rate_limits').insert({
			key,
			attempts: 1,
			window_start: now,
			updated_at: now
		});
		return { blocked: false };
	}

	const windowStart = new Date(record.window_start);
	const windowExpired = now - windowStart > windowMs;

	if (windowExpired) {
		await knex('rate_limits').where({ key }).update({
			attempts: 1,
			window_start: now,
			blocked_until: null,
			updated_at: now
		});
		return { blocked: false };
	}

	const newAttempts = record.attempts + 1;

	await knex('rate_limits').where({ key }).update({
		attempts: newAttempts,
		updated_at: now
	});

	return { blocked: newAttempts >= maxAttempts };
}

// Bulk email blast rate limits (for announcements and events)
export async function checkBlastRateLimit(senderEmail, blastType = 'announcement') {
	const blastKey = `blast:${blastType}:${senderEmail.toLowerCase()}`;
	const cooldownKey = `blast_cooldown:${senderEmail.toLowerCase()}`;
	const knex = getKnex();
	const now = new Date();
	
	// Check cooldown (5 min between blasts)
	const cooldownRecord = await knex('rate_limits').where({ key: cooldownKey }).first();
	if (cooldownRecord) {
		const lastBlast = new Date(cooldownRecord.updated_at);
		const timeSinceLastBlast = now - lastBlast;
		if (timeSinceLastBlast < BLAST_COOLDOWN_MS) {
			const waitTime = Math.ceil((BLAST_COOLDOWN_MS - timeSinceLastBlast) / 1000);
			const waitMinutes = Math.ceil(waitTime / 60);
			return {
				allowed: false,
				reason: 'cooldown',
				message: `Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} before sending another ${blastType}.`,
				retryAfter: waitTime
			};
		}
	}
	
	// Check hourly limit (3 blasts per hour)
	const blastCheck = await checkRateLimitWithWindow(blastKey, MAX_BLASTS_PER_HOUR, BLAST_WINDOW_MS);
	if (!blastCheck.allowed) {
		return {
			allowed: false,
			reason: 'hourly_limit',
			message: `You've sent too many ${blastType}s this hour. You can send ${MAX_BLASTS_PER_HOUR} per hour.`,
			retryAfter: blastCheck.retryAfter
		};
	}
	
	return { allowed: true, remaining: blastCheck.remaining };
}

export async function recordBlastSent(senderEmail, blastType = 'announcement') {
	const blastKey = `blast:${blastType}:${senderEmail.toLowerCase()}`;
	const cooldownKey = `blast_cooldown:${senderEmail.toLowerCase()}`;
	const knex = getKnex();
	const now = new Date();
	
	// Record for hourly limit
	await recordAttemptWithWindow(blastKey, MAX_BLASTS_PER_HOUR, BLAST_WINDOW_MS);
	
	// Update cooldown timestamp
	await knex('rate_limits')
		.insert({
			key: cooldownKey,
			attempts: 1,
			window_start: now,
			updated_at: now
		})
		.onConflict('key')
		.merge({
			updated_at: now
		});
}
