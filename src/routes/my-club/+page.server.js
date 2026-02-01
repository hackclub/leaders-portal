import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser, isClubSuspended } from '$lib/server/sync-clubs.js';
import { deleteMember, sendAnnouncement } from '$lib/server/clubapi.js';
import { getClubSettings } from '$lib/server/airtable.js';
import { debugLog, redactEmail } from '$lib/server/debug.js';

export async function load({ locals }) {
	debugLog('[MyClub] load called, userPublic:', !!locals.userPublic);
	if (!locals.userPublic) {
		debugLog('[MyClub] No userPublic, redirecting to login');
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	debugLog('[MyClub] User loaded, provider:', user?.provider);

	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const clubsWithWebsite = await Promise.all(
		clubs.map(async (club) => {
			const settings = await getClubSettings(club.name);
			
			const suspension = await isClubSuspended(club.id);
			
			return {
				...club,
				clubWebsite: settings?.clubWebsite || '',
				isSuspended: !!suspension,
				suspensionReason: suspension?.reason || null,
				suspendedAt: suspension?.suspended_at || null
			};
		})
	);

	console.log('[MyClub] Returning', clubsWithWebsite?.length, 'clubs');
	return {
		user: locals.userPublic,
		clubs: clubsWithWebsite
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

		const isMemberOfClub = club.members?.includes(memberName);
		if (!isMemberOfClub) {
			return fail(400, { error: 'Member not found in this club' });
		}

		try {
			await deleteMember(memberName, clubName);
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
