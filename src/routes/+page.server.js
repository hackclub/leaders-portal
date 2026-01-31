import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';

export async function load({ locals }) {
	if (!locals.userPublic) {
		return {
			user: null,
			clubs: []
		};
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const completedEvents = await knex('user_completed_events')
		.where({ user_id: locals.userId })
		.orderBy('completed_at', 'desc')
		.limit(5);

	return {
		user: locals.userPublic,
		clubs,
		completedEvents
	};
}
