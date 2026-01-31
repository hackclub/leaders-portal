import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getKnex } from '$lib/server/db/knex.js';
import { deleteSessionByTokenHash } from '$lib/server/auth/sessions.js';

export const actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('sid');

		if (sessionToken) {
			const knex = getKnex();
			const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
			await deleteSessionByTokenHash(knex, tokenHash);
		}

		cookies.delete('sid', { path: '/' });

		throw redirect(302, '/');
	}
};
