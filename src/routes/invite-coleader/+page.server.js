import { redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { getLeaderClubsWithCache } from '$lib/server/club-cache.js';

export async function load({ locals }) {
	if (!locals.userPublic) {
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	
	const clubs = await getLeaderClubsWithCache(effectiveEmail);
	
	const club = clubs.length > 0 ? clubs[0] : null;

	return {
		user: locals.userPublic,
		club
	};
}
