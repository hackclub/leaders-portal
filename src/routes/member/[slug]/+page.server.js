import { error, redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubByCode } from '$lib/server/clubapi.js';

export async function load({ locals, params }) {
	if (!locals.userId) {
		throw redirect(302, `/auth/login?returnTo=/member/${params.slug}`);
	}

	const knex = getKnex();
	const { slug } = params;
	
	// Check membership
	const membership = await knex('club_members')
		.where({ 
			user_id: locals.userId, 
			club_slug: slug,
			status: 'active'
		})
		.first();
	
	if (!membership) {
		throw error(403, 'You are not a member of this club');
	}
	
	// Get user info
	const user = await knex('users').where({ id: locals.userId }).first();
	
	// Get club info from API for additional details
	const clubApi = await getClubByCode(slug);
	const clubLocation = clubApi?.fields?.venue_address_country || null;
	
	// Get announcements for this club (search by club_slug which is the join code)
	const announcements = await knex('club_announcements')
		.where({ club_slug: slug })
		.orderBy('created_at', 'desc')
		.limit(20);
	
	// Get events for this club (search by club_slug which is the join code)
	const events = await knex('club_events')
		.where({ club_slug: slug })
		.where('event_date', '>=', new Date().toISOString().split('T')[0])
		.orderBy('event_date', 'asc')
		.orderBy('event_time', 'asc')
		.limit(10);
	
	// Get past events (last 5)
	const pastEvents = await knex('club_events')
		.where({ club_slug: slug })
		.where('event_date', '<', new Date().toISOString().split('T')[0])
		.orderBy('event_date', 'desc')
		.limit(5);
	
	return {
		user: {
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email
		},
		club: {
			slug,
			name: membership.club_name,
			location: clubLocation,
			joinedAt: membership.joined_at
		},
		announcements: announcements.map(a => ({
			id: a.id,
			subject: a.subject,
			message: a.message,
			createdAt: a.created_at
		})),
		upcomingEvents: events.map(e => ({
			id: e.id,
			title: e.title,
			description: e.description,
			date: e.event_date,
			time: e.event_time,
			location: e.location
		})),
		pastEvents: pastEvents.map(e => ({
			id: e.id,
			title: e.title,
			date: e.event_date
		}))
	};
}

export const actions = {
	leave: async ({ locals, params }) => {
		if (!locals.userId) {
			throw redirect(302, '/auth/login');
		}
		
		const knex = getKnex();
		const { slug } = params;
		
		// Update membership status
		await knex('club_members')
			.where({ 
				user_id: locals.userId, 
				club_slug: slug 
			})
			.update({
				status: 'left',
				removed_at: new Date(),
				removed_by: 'self',
				updated_at: new Date()
			});
		
		throw redirect(302, '/member?left=true');
	}
};
