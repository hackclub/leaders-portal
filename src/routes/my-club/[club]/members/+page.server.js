import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';
import { deleteMember, sendAnnouncement } from '$lib/server/clubapi.js';

export async function load({ locals, params }) {
	if (!locals.userPublic) {
		throw redirect(302, '/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const clubs = await getClubsForEmail(user.email);

	const clubName = decodeURIComponent(params.club);
	const club = clubs.find(c => c.name === clubName);

	if (!club) {
		throw redirect(302, '/my-club');
	}

	return {
		user: locals.userPublic,
		club
	};
}

export const actions = {
	removeMember: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const clubName = decodeURIComponent(params.club);

		if (!memberName) {
			return fail(400, { error: 'Missing member name' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const clubs = await getClubsForEmail(user.email);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can remove members' });
		}

		const isMemberOfClub = club.members?.includes(memberName);
		if (!isMemberOfClub) {
			return fail(400, { error: 'Member not found in this club' });
		}

		try {
			await deleteMember(memberName, clubName);
			return { success: true };
		} catch (error) {
			console.error('[Members] Error removing member:', error);
			return fail(500, { error: 'Failed to remove member' });
		}
	},

	sendAnnouncement: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const message = formData.get('message');
		const clubName = decodeURIComponent(params.club);

		if (!message) {
			return fail(400, { error: 'Missing message' });
		}

		if (message.length > 1000) {
			return fail(400, { error: 'Message too long (max 1000 characters)' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const clubs = await getClubsForEmail(user.email);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can send announcements' });
		}

		try {
			const result = await sendAnnouncement(clubName, message);
			return { success: true, membersUpdated: result.membersUpdated };
		} catch (error) {
			console.error('[Members] Error sending announcement:', error);
			return fail(500, { error: 'Failed to send announcement' });
		}
	}
};
