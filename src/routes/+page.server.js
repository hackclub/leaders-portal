import { redirect } from '@sveltejs/kit';
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

	// If user has no leader clubs, check if they're a member and redirect to member dashboard
	if (!clubs || clubs.length === 0) {
		try {
			const memberClubs = await knex('club_members')
				.where({ user_id: locals.userId, status: 'active' })
				.select('club_slug');
			
			if (memberClubs && memberClubs.length > 0) {
				throw redirect(302, '/member');
			}
		} catch (e) {
			if (e.status === 302) throw e; // Re-throw redirect
			// Table might not exist yet, continue
		}
	}

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
