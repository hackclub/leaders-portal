import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';

export async function load({ locals }) {
	let clubs = [];
	let memberClubs = [];
	
	if (locals.userPublic && locals.userId) {
		try {
			const knex = getKnex();
			const user = await knex('users').where({ id: locals.userId }).first();
			if (user) {
				const effectiveEmail = getEffectiveEmailForUser(user);
				clubs = await getClubsForEmail(effectiveEmail);
				
				// Get clubs the user is a member of (not leader)
				try {
					memberClubs = await knex('club_members')
						.where({ user_id: locals.userId, status: 'active' })
						.select('club_slug', 'club_name', 'joined_at');
				} catch (e) {
					// Table might not exist yet
				}
			}
		} catch (e) {
			console.error('[Layout] Error loading clubs for sidebar:', e.message);
		}
	}
	
	return {
		user: locals.userPublic || null,
		clubs,
		memberClubs
	};
}
