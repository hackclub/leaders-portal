import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getKnex } from '$lib/server/db/knex.js';
import { deleteSessionByTokenHash } from '$lib/server/auth/sessions.js';

export const POST = async ({ cookies, request }) => {
	const origin = request.headers.get('origin');
	const referer = request.headers.get('referer');

	if (origin && referer && !referer.startsWith(origin)) {
		return new Response('Invalid request origin', { status: 403 });
	}

	const sessionToken = cookies.get('sid');

	if (sessionToken) {
		const knex = getKnex();
		const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
		await deleteSessionByTokenHash(knex, tokenHash);
	}

	cookies.delete('sid', { path: '/' });

	throw redirect(302, '/');
};
