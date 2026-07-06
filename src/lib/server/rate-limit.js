import { getKnex } from '$lib/server/db/knex.js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_IP = 10;
const MAX_ATTEMPTS_EMAIL = 5;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

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

// `scope` keeps separate counters for different actions (e.g. requesting an OTP
// vs. verifying one) so that one action cannot exhaust the other's budget.
function scopedKey(scope, type, value) {
	return scope ? `${scope}:${type}:${value}` : `${type}:${value}`;
}

export async function checkIpRateLimit(ip, scope = '') {
	return checkRateLimit(scopedKey(scope, 'ip', ip), MAX_ATTEMPTS_IP);
}

export async function recordIpAttempt(ip, scope = '') {
	return recordAttempt(scopedKey(scope, 'ip', ip), MAX_ATTEMPTS_IP);
}

export async function checkEmailRateLimit(email, scope = '') {
	return checkRateLimit(scopedKey(scope, 'email', email.toLowerCase()), MAX_ATTEMPTS_EMAIL);
}

export async function recordEmailAttempt(email, scope = '') {
	return recordAttempt(scopedKey(scope, 'email', email.toLowerCase()), MAX_ATTEMPTS_EMAIL);
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
