import crypto from 'node:crypto';

export async function createSession(knex, userId, rawToken, meta = {}) {
	const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
	const now = new Date();
	const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

	await knex('sessions').insert({
		id: crypto.randomUUID(),
		user_id: userId,
		session_token_hash: hash,
		created_at: now,
		last_activity_at: now,
		expires_at: expires,
		ip: meta.ip ?? null,
		user_agent: meta.userAgent ?? null
	});
}

export async function findSessionByTokenHash(knex, hash) {
	return knex('sessions')
		.where({ session_token_hash: hash })
		.andWhere('expires_at', '>', knex.fn.now())
		.first();
}

export async function touchSession(knex, id, updates) {
	return knex('sessions').where({ id }).update(updates);
}

export async function deleteSessionById(knex, id) {
	return knex('sessions').where({ id }).del();
}

export async function deleteSessionByTokenHash(knex, hash) {
	return knex('sessions').where({ session_token_hash: hash }).del();
}
