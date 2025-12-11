import { redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';

export async function load({ locals, params }) {
	if (!locals.userPublic) {
		throw redirect(302, '/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const clubs = await getClubsForEmail(user.email);

	const clubName = decodeURIComponent(params.club);
	const club = clubs.find(c => c.name === clubName);

	if (!club) {
		throw redirect(302, '/my-club');
	}

	return {
		user: locals.userPublic,
		club
	};
}
