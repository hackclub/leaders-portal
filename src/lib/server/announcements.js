import { getKnex } from './db/knex.js';

/**
 * Store a sent announcement for a club so members can view it later.
 * @param {string} clubName
 * @param {string} message
 */
export async function saveAnnouncement(clubName, message) {
	const knex = getKnex();
	await knex('club_announcements').insert({
		club_name: clubName,
		message
	});
	console.log('[Announcements] Stored announcement for club:', clubName);
}

/**
 * Get stored announcements for a club, most recent first.
 * @param {string} clubName
 * @param {number} limit
 */
export async function getAnnouncementsForClub(clubName, limit = 50) {
	if (!clubName) return [];
	const knex = getKnex();
	return knex('club_announcements')
		.where({ club_name: clubName })
		.orderBy('created_at', 'desc')
		.limit(limit);
}
