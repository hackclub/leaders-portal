import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

function getKey() {
	const key = env.TOKEN_ENC_KEY;
	if (!key) {
		throw new Error('TOKEN_ENC_KEY environment variable is not set');
	}
	return Buffer.from(key, 'base64');
}

export function encrypt(value) {
	const key = getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return { ciphertext, iv, tag };
}

export function decrypt(ciphertext, iv, tag) {
	const key = getKey();
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
	return plaintext.toString('utf8');
}
