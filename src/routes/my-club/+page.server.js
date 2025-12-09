import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';
import { deleteMember } from '$lib/server/clubapi.js';

export async function load({ locals }) {
	console.log('[MyClub] load called, userPublic:', !!locals.userPublic, 'userId:', locals.userId);
	if (!locals.userPublic) {
		console.log('[MyClub] No userPublic, redirecting to login');
		throw redirect(302, '/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	console.log('[MyClub] User from DB:', user ? { id: user.id, email: user.email, provider: user.provider } : null);

	const clubs = await getClubsForEmail(user.email);

	console.log('[MyClub] Returning', clubs?.length, 'clubs');
	return {
		user: locals.userPublic,
		clubs
	};
}

export const actions = {
	removeMember: async ({ request, locals }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const clubName = formData.get('clubName');

		if (!memberName || !clubName) {
			return fail(400, { error: 'Missing member or club name' });
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

		try {
			await deleteMember(memberName);
			return { success: true };
		} catch (error) {
			console.error('[MyClub] Error removing member:', error);
			return fail(500, { error: 'Failed to remove member' });
		}
	}
};
