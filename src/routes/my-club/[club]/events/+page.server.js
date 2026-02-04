import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { sendEventNotification } from '$lib/server/email.js';
import { checkBlastRateLimit, recordBlastSent } from '$lib/server/rate-limit.js';

export async function load({ locals, params }) {
	if (!locals.userPublic) {
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const clubName = decodeURIComponent(params.club);
	const club = clubs.find(c => c.name === clubName);

	if (!club) {
		throw redirect(302, '/my-club');
	}

	// Get events for this club
	let events = [];
	try {
		events = await knex('club_events')
			.where({ club_name: clubName })
			.orderBy('event_date', 'asc');
	} catch (e) {
		// Table might not exist yet
		console.log('Could not fetch events:', e.message);
	}

	return {
		user: locals.userPublic,
		club,
		events
	};
}

export const actions = {
	createEvent: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const title = formData.get('title');
		const description = formData.get('description');
		const eventDate = formData.get('eventDate');
		const eventTime = formData.get('eventTime');
		const location = formData.get('location');
		const notifyMembers = formData.get('notifyMembers') === 'on';
		const clubName = decodeURIComponent(params.club);

		if (!title || !eventDate) {
			return fail(400, { error: 'Title and date are required' });
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
			return fail(403, { error: 'Only club leaders can create events' });
		}

		// Check rate limit if sending notifications
		if (notifyMembers) {
			const rateCheck = await checkBlastRateLimit(effectiveEmail, 'event notification');
			if (!rateCheck.allowed) {
				return fail(429, { error: rateCheck.message });
			}
		}

		try {
			// Combine date and time for the full event datetime
			let fullEventDate = eventDate;
			if (eventTime) {
				fullEventDate = `${eventDate}T${eventTime}`;
			}

			await knex('club_events').insert({
				club_name: clubName,
				club_slug: club.joinCode || null,
				title: title,
				description: description || null,
				event_date: eventDate,
				event_time: eventTime || null,
				location: location || null,
				created_by: user.email,
				created_at: new Date()
			});

			// Send event notification emails if requested
			if (notifyMembers) {
				// Get authenticated members from our database
				const authenticatedMembers = await knex('club_members')
					.join('users', 'club_members.user_id', 'users.id')
					.where({ 
						'club_members.club_name': clubName,
						'club_members.status': 'active'
					})
					.select('users.email', 'users.first_name', 'users.last_name', 'users.username');

				// Build recipients list (authenticated members + leaders)
				const recipients = [];

				// Add authenticated members
				for (const member of authenticatedMembers) {
					if (member.email) {
						recipients.push({
							email: member.email,
							name: [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username || member.email?.split('@')[0]
						});
					}
				}

				// Add leaders
				if (club.leaders && Array.isArray(club.leaders)) {
					for (const leader of club.leaders) {
						const leaderEmail = typeof leader === 'object' ? leader.email : leader;
						if (leaderEmail && !recipients.find(r => r.email === leaderEmail)) {
							recipients.push({
								email: leaderEmail,
								name: typeof leader === 'object' ? leader.name : leaderEmail.split('@')[0]
							});
						}
					}
				}

				// Also add the current user if not already included
				if (effectiveEmail && !recipients.find(r => r.email === effectiveEmail)) {
					const senderName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || effectiveEmail.split('@')[0];
					recipients.push({
						email: effectiveEmail,
						name: senderName
					});
				}

				// Send emails to all recipients
				for (const recipient of recipients) {
					try {
						await sendEventNotification({
							recipientEmail: recipient.email,
							recipientName: recipient.name,
							clubName: clubName,
							eventTitle: title,
							eventDescription: description,
							eventDate: fullEventDate,
							eventLocation: location
						});
					} catch (err) {
						console.error(`Failed to send event notification to ${recipient.email}:`, err.message);
					}
				}

				// Record the blast for rate limiting
				await recordBlastSent(effectiveEmail, 'event notification');
			}

			return { createSuccess: true };
		} catch (error) {
			console.error('[Events] Error creating event:', error);
			return fail(500, { error: 'Failed to create event' });
		}
	},

	updateEvent: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const eventId = formData.get('id');
		const title = formData.get('title');
		const description = formData.get('description');
		const eventDate = formData.get('eventDate');
		const eventTime = formData.get('eventTime');
		const location = formData.get('location');
		const clubName = decodeURIComponent(params.club);

		if (!eventId || !title || !eventDate) {
			return fail(400, { error: 'Event ID, title and date are required' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can update events' });
		}

		try {
			await knex('club_events')
				.where({ id: eventId, club_name: clubName })
				.update({
					title: title,
					description: description || null,
					event_date: eventDate,
					event_time: eventTime || null,
					location: location || null,
					updated_at: new Date()
				});

			return { updateSuccess: true };
		} catch (error) {
			console.error('[Events] Error updating event:', error);
			return fail(500, { error: 'Failed to update event' });
		}
	},

	deleteEvent: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const eventId = formData.get('id');
		const clubName = decodeURIComponent(params.club);

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can delete events' });
		}

		try {
			await knex('club_events')
				.where({ id: eventId, club_name: clubName })
				.delete();
			return { deleteSuccess: true };
		} catch (error) {
			console.error('[Events] Error deleting event:', error);
			return fail(500, { error: 'Failed to delete event' });
		}
	}
};
