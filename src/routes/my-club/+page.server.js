import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { deleteMember, sendAnnouncement } from '$lib/server/clubapi.js';
import { getClubSettings, getClubLeaders, getColeaders } from '$lib/server/airtable.js';

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

	const clubsWithWebsite = await Promise.all(
		clubs.map(async (club) => {
			const [settings, leaders, coleaders] = await Promise.all([
				getClubSettings(club.name),
				getClubLeaders(club.name),
				getColeaders(club.name)
			]);

			// Count members but avoid double-counting anyone already listed as a leader
			const nonLeaderMembers = (club.members || []).filter(
				(member) => !leaders.some((l) => l.name.toLowerCase() === member.toLowerCase())
			);
			const memberCount = leaders.length + coleaders.length + nonLeaderMembers.length;

			return {
				...club,
				clubWebsite: settings?.clubWebsite || '',
				memberCount
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
	},

	changeLeader: async ({ request, locals, cookies }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const clubName = formData.get('clubName');
		const newEmail = formData.get('newEmail');

		if (!clubName || !newEmail) {
			return fail(400, { error: 'Missing club name or new email' });
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
			return fail(403, { error: 'Only club leaders can change the leader' });
		}

		try {
			const { changeLeader } = await import('$lib/server/clubapi.js');
			await changeLeader(clubName, newEmail, effectiveEmail);
			
			const { refreshClubFromApi, invalidateLeaderCache } = await import('$lib/server/club-cache.js');
			await refreshClubFromApi(clubName);
			await invalidateLeaderCache(effectiveEmail);
			await invalidateLeaderCache(newEmail);

			const sessionToken = cookies.get('sid');
			if (sessionToken) {
				const crypto = await import('node:crypto');
				const { deleteSessionByTokenHash } = await import('$lib/server/auth/sessions.js');
				const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
				await deleteSessionByTokenHash(knex, tokenHash);
			}
			cookies.delete('sid', { path: '/' });
			
			throw redirect(302, '/?message=Leader changed successfully. Please log in again.');
		} catch (error) {
			if (error.status === 302) throw error;
			console.error('[MyClub] Error changing leader:', error);
			return fail(500, { error: 'Failed to change leader' });
		}
	}
};
