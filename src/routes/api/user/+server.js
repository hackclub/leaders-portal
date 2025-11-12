import { json, error } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getUserClubs } from '$lib/server/auth/clubs.js';

export const GET = async ({ locals }) => {
	if (!locals.userPublic) {
		throw error(401, 'Unauthorized');
	}

	try {
		const knex = getKnex();
		const clubs = await getUserClubs(knex, locals.userId);

		return json({
			username: locals.userPublic.username,
			email: locals.userPublic.email,
			firstName: locals.userPublic.firstName,
			clubs: clubs,
			totalClubs: clubs.length
		});
	} catch (err) {
		console.error('Error fetching user data:', err);
		throw error(500, 'Failed to fetch user data');
	}
};
