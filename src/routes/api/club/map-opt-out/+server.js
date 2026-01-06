import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { getMapOptOut, toggleMapOptOut, optInToMap } from '$lib/server/airtable.js';

export async function GET({ url, locals }) {
	if (!locals.userPublic) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const clubName = url.searchParams.get('clubName');
	if (!clubName) {
		return json({ error: 'Missing club name' }, { status: 400 });
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const club = clubs.find(c => c.name === clubName);
	if (!club) {
		return json({ error: 'You do not have access to this club' }, { status: 403 });
	}

	const result = await getMapOptOut(clubName);
	if (!result) {
		return json({ optedOut: false, hasLocation: false, venueLat: null, venueLng: null });
	}
	return json({ 
		optedOut: result.optedOut, 
		hasLocation: result.hasLocation,
		venueLat: result.venueLat,
		venueLng: result.venueLng
	});
}

export async function POST({ request, locals }) {
	if (!locals.userPublic) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const body = await request.json();
	const { clubName, action, latitude, longitude } = body;
	if (!clubName) {
		return json({ error: 'Missing club name' }, { status: 400 });
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const club = clubs.find(c => c.name === clubName);
	if (!club) {
		return json({ error: 'You do not have access to this club' }, { status: 403 });
	}

	if (club.role !== 'leader') {
		return json({ error: 'Only club leaders can change this setting' }, { status: 403 });
	}

	try {
		if (action === 'optIn') {
			if (typeof latitude !== 'number' || typeof longitude !== 'number') {
				return json({ error: 'Latitude and longitude are required for opt-in' }, { status: 400 });
			}
			const result = await optInToMap(clubName, latitude, longitude);
			return json({ success: true, optedOut: result.optedOut, hasLocation: result.hasLocation });
		} else {
			const result = await toggleMapOptOut(clubName);
			return json({ success: true, optedOut: result.optedOut });
		}
	} catch (error) {
		console.error('[MapOptOut] Error:', error);
		return json({ error: 'Failed to update setting' }, { status: 500 });
	}
}
