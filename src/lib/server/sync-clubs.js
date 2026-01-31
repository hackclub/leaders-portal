import { getLeaderClubsWithCache, getClubWithCache } from './club-cache.js';
import { getKnex } from './db/knex.js';
import { debugLog, redactEmail } from './debug.js';

export function getEffectiveEmailForUser(user) {
	if (user.provider === 'hackclub_auth' && user.hackclub_primary_email) {
		return user.hackclub_primary_email;
	}
	return user.email;
}

export async function isClubSuspended(clubId) {
	const knex = getKnex();
	try {
		const suspended = await knex('suspended_clubs').where({ provider_club_id: clubId }).first();
		return suspended || null;
	} catch (err) {
		return null;
	}
}

export async function getClubDataFromApi(clubName) {
	debugLog('[SyncClubs] getClubDataFromApi called for:', clubName);
	const clubData = await getClubWithCache(clubName);
	debugLog('[SyncClubs] Got club data, level:', clubData.level, 'ships count:', clubData.ships?.length);
	return clubData;
}

export async function getClubsForEmail(email) {
	debugLog('[SyncClubs] getClubsForEmail called for email:', redactEmail(email));
	const clubs = await getLeaderClubsWithCache(email);
	debugLog('[SyncClubs] Got', clubs.length, 'clubs for email');
	return clubs;
}
