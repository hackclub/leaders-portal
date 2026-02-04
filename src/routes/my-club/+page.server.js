import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser, isClubSuspended } from '$lib/server/sync-clubs.js';
import { deleteMember } from '$lib/server/clubapi.js';
import { sendClubAnnouncement } from '$lib/server/email.js';
import { getClubSettings } from '$lib/server/airtable.js';
import { debugLog, redactEmail } from '$lib/server/debug.js';
import { checkBlastRateLimit, recordBlastSent } from '$lib/server/rate-limit.js';

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
						subject: 'Club Announcement',
						message: message,
						senderName: senderName
					});
					sentCount++;
				} catch (err) {
					console.error(`Failed to send announcement to ${recipient.email}:`, err.message);
				}
			}

			// Record the blast for rate limiting
			await recordBlastSent(effectiveEmail, 'announcement');

			return { success: true, membersUpdated: sentCount };
		} catch (error) {
			console.error('[MyClub] Error sending announcement:', error);
			return fail(500, { error: 'Failed to send announcement' });
		}
	}
};
