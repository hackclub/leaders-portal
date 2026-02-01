import { redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser, isClubSuspended } from '$lib/server/sync-clubs.js';
import { getClubSettings } from '$lib/server/airtable.js';

export async function load({ params, locals }) {
	if (!locals.userPublic) {
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const club = clubs.find(c => c.id === params.club || c.name === params.club || 
		c.name.toLowerCase().replace(/\s+/g, '-') === params.club.toLowerCase());

	if (!club) {
		throw redirect(302, '/my-club');
	}

	const settings = await getClubSettings(club.name);
	const suspension = await isClubSuspended(club.id);

	return {
		user: locals.userPublic,
		club: {
			...club,
			clubWebsite: settings?.clubWebsite || '',
			isSuspended: !!suspension,
			suspensionReason: suspension?.reason || null,
			suspendedAt: suspension?.suspended_at || null
		}
	};
}
