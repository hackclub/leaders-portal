import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { deleteMember, sendAnnouncement } from '$lib/server/clubapi.js';

export async function load({ locals }) {
	console.log('[MyClub] load called, userPublic:', !!locals.userPublic, 'userId:', locals.userId);
	if (!locals.userPublic) {
		console.log('[MyClub] No userPublic, redirecting to login');
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	console.log('[MyClub] User from DB:', user ? { id: user.id, email: user.email, provider: user.provider } : null);

	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	console.log('[MyClub] Returning', clubs?.length, 'clubs');
	return {
		user: locals.userPublic,
		clubs
	};
}

export const actions = {
	removeMember: async ({ request, locals }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const clubName = formData.get('clubName');

		if (!memberName || !clubName) {
			return fail(400, { error: 'Missing member or club name' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can remove members' });
		}

		try {
			await deleteMember(memberName);
			return { success: true };
		} catch (error) {
			console.error('[MyClub] Error removing member:', error);
			return fail(500, { error: 'Failed to remove member' });
		}
	},

	sendAnnouncement: async ({ request, locals }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const clubName = formData.get('clubName');
		const message = formData.get('message');

		if (!clubName || !message) {
			return fail(400, { error: 'Missing club name or message' });
		}

		if (message.length > 1000) {
			return fail(400, { error: 'Message too long (max 1000 characters)' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

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
			console.error('[MyClub] Error sending announcement:', error);
			return fail(500, { error: 'Failed to send announcement' });
		}
	}
};
