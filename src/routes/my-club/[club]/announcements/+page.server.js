import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { sendClubAnnouncement } from '$lib/server/email.js';
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

	// Get announcements for this club
	let announcements = [];
	try {
		announcements = await knex('club_announcements')
			.where({ club_id: clubName })
			.orderBy('created_at', 'desc')
			.limit(50);
	} catch (e) {
		// Table might not exist yet
		console.log('Could not fetch announcements:', e.message);
	}

	return {
		user: locals.userPublic,
		club,
		announcements
	};
}

export const actions = {
	sendAnnouncement: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const message = formData.get('message');
		const title = formData.get('title') || 'Club Announcement';
		const clubName = decodeURIComponent(params.club);

		if (!message) {
			return fail(400, { error: 'Message is required' });
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

		// Check rate limit for announcements
		const rateCheck = await checkBlastRateLimit(effectiveEmail, 'announcement');
		if (!rateCheck.allowed) {
			return fail(429, { error: rateCheck.message });
		}

		try {
			// Get the sender name
			const senderName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email?.split('@')[0] || 'Club Leader';

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

			// Add leaders (including the sender, so they get a copy)
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
				recipients.push({
					email: effectiveEmail,
					name: senderName
				});
			}

			// Send emails to all recipients
			let sentCount = 0;
			for (const recipient of recipients) {
				try {
					await sendClubAnnouncement({
						recipientEmail: recipient.email,
						recipientName: recipient.name,
						clubName: clubName,
						subject: title,
						message: message,
						senderName: senderName
					});
					sentCount++;
				} catch (err) {
					console.error(`Failed to send announcement to ${recipient.email}:`, err.message);
				}
			}

			// Save announcement to database
			try {
				await knex('club_announcements').insert({
					club_id: clubName,
					club_slug: club.joinCode || null,
					subject: title,
					message: message,
					sent_by: user.id,
					member_count: sentCount,
					created_at: new Date()
				});
			} catch (e) {
				// Table might not exist, just log
				console.log('Could not save announcement to db:', e.message);
			}

			// Record the blast for rate limiting
			await recordBlastSent(effectiveEmail, 'announcement');

			return { 
				announcementSuccess: true, 
				recipientCount: sentCount
			};
		} catch (error) {
			console.error('[Announcements] Error sending announcement:', error);
			return fail(500, { error: 'Failed to send announcement' });
		}
	},

	updateAnnouncement: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const announcementId = formData.get('id');
		const subject = formData.get('title') || 'Club Announcement';
		const message = formData.get('message');
		const clubName = decodeURIComponent(params.club);

		if (!announcementId || !message) {
			return fail(400, { error: 'Announcement ID and message are required' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can update announcements' });
		}

		try {
			await knex('club_announcements')
				.where({ id: announcementId, club_id: clubName })
				.update({
					subject: subject,
					message: message
				});
			return { updateSuccess: true };
		} catch (error) {
			console.error('[Announcements] Error updating announcement:', error);
			return fail(500, { error: 'Failed to update announcement' });
		}
	},

	deleteAnnouncement: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const announcementId = formData.get('id');
		const clubName = decodeURIComponent(params.club);

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can delete announcements' });
		}

		try {
			await knex('club_announcements')
				.where({ id: announcementId, club_id: clubName })
				.delete();
			return { deleteSuccess: true };
		} catch (error) {
			console.error('[Announcements] Error deleting announcement:', error);
			return fail(500, { error: 'Failed to delete announcement' });
		}
	}
};
