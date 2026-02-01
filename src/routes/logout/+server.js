import { redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getKnex } from '$lib/server/db/knex.js';
import { deleteSessionByTokenHash } from '$lib/server/auth/sessions.js';

async function handleLogout(cookies) {
	const sessionToken = cookies.get('sid');

	if (sessionToken) {
		const knex = getKnex();
		const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
		await deleteSessionByTokenHash(knex, tokenHash);
	}

	cookies.delete('sid', { path: '/' });
}

export const GET = async ({ cookies }) => {
	// by not handling them here - let +page.svelte render
	return new Response(null, { status: 404 });
};

export const POST = async ({ cookies, request }) => {
	const origin = request.headers.get('origin');
	const referer = request.headers.get('referer');

	if (origin && referer && !referer.startsWith(origin)) {
		return new Response('Invalid request origin', { status: 403 });
	}

	await handleLogout(cookies);

	throw redirect(302, '/');
};
