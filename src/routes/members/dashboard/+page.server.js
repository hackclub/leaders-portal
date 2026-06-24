import { redirect, fail } from '@sveltejs/kit';
import { getMemberShips } from '$lib/server/clubapi.js';
import { getMemberClubName } from '$lib/server/airtable.js';
import { getAnnouncementsForClub } from '$lib/server/announcements.js';
import {
	getUpcomingEventsForClub,
	getEventsForClub,
	getEventById,
	setRsvp,
	removeRsvp,
	attachRsvps
} from '$lib/server/events.js';
import { getClubWithCache } from '$lib/server/club-cache.js';
import { getChatMessages, saveChatMessage } from '$lib/server/chat.js';

export async function load({ locals }) {
	const user = locals.userPublic;

	if (!user || user.provider !== 'member') {
		throw redirect(302, '/members/login');
	}

	const ships = user.email ? await getMemberShips(user.email) : [];
	const clubName = user.email ? await getMemberClubName(user.email) : null;
	const announcements = clubName ? await getAnnouncementsForClub(clubName) : [];
	const events = clubName
		? await attachRsvps(await getUpcomingEventsForClub(clubName), user.email)
		: [];
	const calendarEvents = clubName
		? await attachRsvps(await getEventsForClub(clubName), user.email)
		: [];
	const club = clubName ? await getClubWithCache(clubName) : null;
	const chatMessages = clubName ? await getChatMessages(clubName) : [];

	return {
		user,
		ships,
		clubName,
		announcements,
		events,
		calendarEvents,
		club,
		chatMessages
	};
}

export const actions = {
	sendChatMessage: async ({ request, locals }) => {
		const user = locals.userPublic;

		if (!user || user.provider !== 'member') {
			throw redirect(302, '/members/login');
		}

		const formData = await request.formData();
		const message = formData.get('message');

		if (!message) {
			return fail(400, { error: 'Missing message' });
		}

		const trimmed = message.toString().trim();
		if (!trimmed) {
			return fail(400, { error: 'Message cannot be empty' });
		}

		if (trimmed.length > 1000) {
			return fail(400, { error: 'Message too long (max 1000 characters)' });
		}

		// Derive the club from the member's own record so a member can only
		// post to the club they actually belong to.
		const clubName = user.email ? await getMemberClubName(user.email) : null;
		if (!clubName) {
			return fail(403, { error: 'You are not a member of a club' });
		}

		const senderName = user.firstName || user.email;

		try {
			await saveChatMessage({
				clubName,
				senderName,
				senderEmail: user.email,
				isLeader: false,
				message: trimmed
			});
			return { success: true, chatSent: true };
		} catch (error) {
			console.error('[MemberDashboard] Error sending chat message:', error);
			return fail(500, { error: 'Failed to send message' });
		}
	},

	rsvp: async ({ request, locals }) => {
		const user = locals.userPublic;

		if (!user || user.provider !== 'member') {
			throw redirect(302, '/members/login');
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId');
		const status = formData.get('status');

		if (!eventId) {
			return fail(400, { error: 'Missing event id' });
		}

		// Derive the club from the member's own record so a member can only
		// RSVP to events in the club they actually belong to.
		const clubName = user.email ? await getMemberClubName(user.email) : null;
		if (!clubName) {
			return fail(403, { error: 'You are not a member of a club' });
		}

		const event = await getEventById(Number(eventId));
		if (!event || event.club_name !== clubName) {
			return fail(403, { error: 'You cannot RSVP to this event' });
		}

		try {
			if (status === 'clear') {
				await removeRsvp({ eventId: Number(eventId), memberEmail: user.email });
			} else if (status === 'going' || status === 'not_going') {
				await setRsvp({
					eventId: Number(eventId),
					memberEmail: user.email,
					memberName: user.firstName || user.email,
					status: status.toString()
				});
			} else {
				return fail(400, { error: 'Invalid RSVP status' });
			}
			return { success: true, rsvpUpdated: true };
		} catch (error) {
			console.error('[MemberDashboard] Error saving RSVP:', error);
			return fail(500, { error: 'Failed to save RSVP' });
		}
	}
};
