import crypto from 'node:crypto';

export function generateOTP() {
	return crypto.randomInt(100000, 999999).toString();
}

function safeCompare(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string') {
		return false;
	}
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
		return false;
	}
	return crypto.timingSafeEqual(bufA, bufB);
}

export async function createOTP(knex, email) {
	const code = generateOTP();
	const now = new Date();
	const expires = new Date(now.getTime() + 10 * 60 * 1000);

	await knex('otp_codes')
		.where({ email, used: false })
		.update({ used: true });

	await knex('otp_codes').insert({
		id: crypto.randomUUID(),
		email,
		code,
		created_at: now,
		expires_at: expires,
		used: false
	});

	return code;
}

export async function verifyOTP(knex, email, code) {
	const otp = await knex('otp_codes')
		.where({ email, used: false })
		.andWhere('expires_at', '>', knex.fn.now())
		.orderBy('created_at', 'desc')
		.first();

	if (!otp) {
		return false;
	}

	if (!safeCompare(otp.code, code)) {
		return false;
	}

	await knex('otp_codes').where({ id: otp.id }).update({ used: true });

	return true;
}

export async function cleanupExpiredOTPs(knex) {
	await knex('otp_codes')
		.where('expires_at', '<', knex.fn.now())
		.delete();
}
