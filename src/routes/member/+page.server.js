import { redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';

export async function load({ locals }) {
	if (!locals.userId) {
		throw redirect(302, '/auth/login?returnTo=/member');
	}

	const knex = getKnex();
	
	// Get user info
	const user = await knex('users').where({ id: locals.userId }).first();
	
	// Get all clubs the user is a member of
	const memberships = await knex('club_members')
		.where({ user_id: locals.userId, status: 'active' })
		.orderBy('joined_at', 'desc');
	
	// Get clubs with their details
	const clubs = memberships.map(m => ({
		slug: m.club_slug,
		name: m.club_name,
		joinedAt: m.joined_at
	}));
	
	return {
		user: {
			id: user.id,
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email
		},
		clubs
	};
}
