import { redirect } from '@sveltejs/kit';
import { getMemberShips } from '$lib/server/clubapi.js';
import { getMemberClubName } from '$lib/server/airtable.js';
import { getAnnouncementsForClub } from '$lib/server/announcements.js';
import { getUpcomingEventsForClub, getEventsForClub } from '$lib/server/events.js';
import { getClubWithCache } from '$lib/server/club-cache.js';

export async function load({ locals }) {
	const user = locals.userPublic;

	if (!user || user.provider !== 'member') {
		throw redirect(302, '/members/login');
	}

	const ships = user.email ? await getMemberShips(user.email) : [];
	const clubName = user.email ? await getMemberClubName(user.email) : null;
	const announcements = clubName ? await getAnnouncementsForClub(clubName) : [];
	const events = clubName ? await getUpcomingEventsForClub(clubName) : [];
	const calendarEvents = clubName ? await getEventsForClub(clubName) : [];
	const club = clubName ? await getClubWithCache(clubName) : null;

	return {
		user,
		ships,
		clubName,
		announcements,
		events,
		calendarEvents,
		club
	};
}
