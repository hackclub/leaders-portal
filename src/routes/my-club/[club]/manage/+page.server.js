import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { getClubSettings, updateClubSettings, updateMapSettings } from '$lib/server/airtable.js';
import { invalidateClubCache } from '$lib/server/club-cache.js';
import { getJoinPageColors, updateJoinPageColors } from '$lib/server/club-join-colors.js';

export async function load({ locals, params }) {
	if (!locals.userPublic) {
		throw redirect(302, '/auth/login');
	}

	const clubName = decodeURIComponent(params.club);

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const club = clubs.find(c => c.name === clubName);
	if (!club) {
		throw redirect(302, '/my-club');
	}

	if (club.role !== 'leader') {
		throw redirect(302, '/my-club');
	}

	const settings = await getClubSettings(clubName);
	const joinColors = await getJoinPageColors(clubName);

	return {
		user: locals.userPublic,
		club,
		settings,
		joinColors
	};
}

export const actions = {
	updateSettings: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const clubName = decodeURIComponent(params.club);

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { error: 'You do not have permission to manage this club' });
		}

		const currentSettings = await getClubSettings(clubName);
		if (!currentSettings) {
			return fail(404, { error: 'Club not found' });
		}

		const formData = await request.formData();
		const updates = {};

		const newClubName = formData.get('club_name')?.toString().trim();
		if (newClubName && newClubName !== currentSettings.clubName) {
			updates['club_name'] = newClubName;
		}

		const clubStatus = formData.get('club_status')?.toString();
		if (clubStatus && clubStatus !== currentSettings.clubStatus) {
			updates['club_status'] = clubStatus;
		}

		const venueType = formData.get('venue_type')?.toString();
		if (venueType !== undefined) {
			updates['venue_type'] = venueType;
		}

		const venueName = formData.get('venue_name')?.toString().trim();
		if (venueName !== undefined) {
			updates['venue_name'] = venueName;
		}

		const venueAddressLine1 = formData.get('venue_address_line_1')?.toString().trim();
		if (venueAddressLine1 !== undefined) {
			updates['venue_address_line_1'] = venueAddressLine1;
		}

		const venueAddressCity = formData.get('venue_address_city')?.toString().trim();
		if (venueAddressCity !== undefined) {
			updates['venue_address_city'] = venueAddressCity;
		}

		const venueAddressState = formData.get('venue_address_state')?.toString().trim();
		if (venueAddressState !== undefined) {
			updates['venue_address_state'] = venueAddressState;
		}

		const venueAddressCountry = formData.get('venue_address_country')?.toString().trim();
		if (venueAddressCountry !== undefined) {
			updates['venue_address_country'] = venueAddressCountry;
		}

		const venueAddressZip = formData.get('venue_address_zip')?.toString().trim();
		if (venueAddressZip !== undefined) {
			updates['venue_address_zip'] = venueAddressZip;
		}

		const estAttendees = formData.get('est_attendees')?.toString().trim();
		if (estAttendees !== undefined) {
			updates['Est. # of Attendees'] = Number(estAttendees);
		}

		const callMeetingDays = formData.getAll('call_meeting_days').map(v => v.toString());
		updates['call_meeting_days'] = callMeetingDays;

		const callMeetingLength = formData.get('call_meeting_length')?.toString();
		if (callMeetingLength !== undefined) {
			updates['call_meeting_length'] = callMeetingLength;
		}

		const callClubIntrest = formData.getAll('call_club_intrest').map(v => v.toString());
		updates['call_club_intrest'] = callClubIntrest;

		const clubWebsite = formData.get('club_website')?.toString().trim();
		if (clubWebsite !== undefined) {
			updates['club_website'] = clubWebsite;
		}

		if (Object.keys(updates).length === 0) {
			return { success: true, message: 'No changes to save' };
		}

		try {
			await updateClubSettings(clubName, updates, currentSettings.clubStatus);
			await invalidateClubCache(clubName);
			
			if (updates['club_name']) {
				throw redirect(302, `/my-club/${encodeURIComponent(updates['club_name'])}/manage?success=1`);
			}
			
			return { success: true, message: 'Settings updated successfully' };
		} catch (error) {
			if (error.status === 302) {
				throw error;
			}
			console.error('[ManageClub] Error updating settings:', error);
			return fail(400, { error: error.message || 'Failed to update settings' });
		}
	},

	updateMapSettings: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const clubName = decodeURIComponent(params.club);

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { mapError: 'You do not have permission to manage this club' });
		}

		const formData = await request.formData();
		const latitude = parseFloat(formData.get('latitude')?.toString() || '');
		const longitude = parseFloat(formData.get('longitude')?.toString() || '');
		const fuzz = parseFloat(formData.get('fuzz')?.toString() || '0');
		const optedOut = formData.get('opted_out') === 'true';

		if (isNaN(latitude) || isNaN(longitude)) {
			return fail(400, { mapError: 'Please enter valid latitude and longitude values' });
		}

		if (latitude < -90 || latitude > 90) {
			return fail(400, { mapError: 'Latitude must be between -90 and 90' });
		}

		if (longitude < -180 || longitude > 180) {
			return fail(400, { mapError: 'Longitude must be between -180 and 180' });
		}

		if (isNaN(fuzz) || fuzz < -0.5 || fuzz > 0.5) {
			return fail(400, { mapError: 'Offset must be between -0.5 and 0.5' });
		}

		try {
			await updateMapSettings(clubName, { optedOut, latitude, longitude, fuzz });
			return { mapSuccess: true, message: 'Map settings updated successfully' };
		} catch (error) {
			console.error('[ManageClub] Error updating map settings:', error);
			return fail(500, { mapError: 'Failed to update map settings' });
		}
	},

	updateJoinColors: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const clubName = decodeURIComponent(params.club);

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club || club.role !== 'leader') {
			return fail(403, { colorsError: 'You do not have permission to manage this club' });
		}

		const formData = await request.formData();
		const colors = {
			bgColor: formData.get('bg_color')?.toString(),
			cardColor: formData.get('card_color')?.toString(),
			textColor: formData.get('text_color')?.toString(),
			buttonColor: formData.get('button_color')?.toString()
		};

		try {
			const joinColors = await updateJoinPageColors(clubName, colors);
			return { colorsSuccess: true, message: 'Join page colors updated successfully', joinColors };
		} catch (error) {
			console.error('[ManageClub] Error updating join page colors:', error);
			return fail(500, { colorsError: 'Failed to update join page colors' });
		}
	}
};
