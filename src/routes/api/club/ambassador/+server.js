import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubAmbassador } from '$lib/server/clubapi.js';
import { getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { getLeaderClubsWithCache } from '$lib/server/club-cache.js';

export async function GET({ url, locals }) {
	if (!locals.userPublic) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const clubName = url.searchParams.get('club_name');
	if (!clubName) {
		return json({ error: 'Missing club_name parameter' }, { status: 400 });
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getLeaderClubsWithCache(effectiveEmail);
	
	const hasAccess = clubs.some(c => c.name === clubName);
	if (!hasAccess) {
		return json({ error: 'Access denied to this club' }, { status: 403 });
	}

	const ambassador = await getClubAmbassador(clubName);
	if (!ambassador) {
		return json({ error: 'Ambassador not found' }, { status: 404 });
	}

	return json(ambassador);
}
