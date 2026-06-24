import { getKnex } from './db/knex.js';

/**
 * Get chat messages for a club, oldest first so they read chronologically.
 * @param {string} clubName
 * @param {number} limit - maximum number of recent messages to return
 */
export async function getChatMessages(clubName, limit = 200) {
	if (!clubName) return [];
	const knex = getKnex();
	// Grab the most recent `limit` messages, then return them oldest-first.
	const rows = await knex('club_chat_messages')
		.where({ club_name: clubName })
		.orderBy('created_at', 'desc')
		.orderBy('id', 'desc')
		.limit(limit);
	return rows.reverse();
}

/**
 * Store a chat message for a club.
 * @param {object} msg
 * @param {string} msg.clubName
 * @param {string} msg.senderName
 * @param {string} msg.senderEmail
 * @param {boolean} msg.isLeader
 * @param {string} msg.message
 */
export async function saveChatMessage({ clubName, senderName, senderEmail, isLeader, message }) {
	const knex = getKnex();
	await knex('club_chat_messages').insert({
		club_name: clubName,
		sender_name: senderName,
		sender_email: senderEmail,
		is_leader: !!isLeader,
		message
	});
	console.log('[Chat] Stored message for club:', clubName);
}

/**
 * Delete a chat message belonging to a specific club. Scoping by club_name
 * ensures a leader can only delete messages in a club they have access to.
 * @param {number} id
 * @param {string} clubName
 * @returns {Promise<number>} number of rows deleted
 */
export async function deleteChatMessage(id, clubName) {
	const knex = getKnex();
	return knex('club_chat_messages')
		.where({ id, club_name: clubName })
		.del();
}
