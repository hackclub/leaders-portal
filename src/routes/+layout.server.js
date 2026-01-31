import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';

export async function load({ locals }) {
	let clubs = [];
	
	if (locals.userPublic && locals.userId) {
		try {
			const knex = getKnex();
			const user = await knex('users').where({ id: locals.userId }).first();
			if (user) {
				const effectiveEmail = getEffectiveEmailForUser(user);
				clubs = await getClubsForEmail(effectiveEmail);
			}
		} catch (e) {
			console.error('[Layout] Error loading clubs for sidebar:', e.message);
		}
	}
	
	return {
		user: locals.userPublic || null,
		clubs
	};
}
