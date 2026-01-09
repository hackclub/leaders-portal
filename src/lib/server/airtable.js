import Airtable from 'airtable';
import { env } from '$env/dynamic/private';

export { checkLeaderEmail, getClubsForLeaderEmail as getClubsForLeader } from './clubapi.js';

function getAirtableBase() {
	if (!env.AIRTABLE_API_KEY) {
		throw new Error("Missing AIRTABLE_API_KEY");
	}
	if (!env.AIRTABLE_BASE_ID) {
		throw new Error("Missing AIRTABLE_BASE_ID");
	}
	return new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
}

function escapeAirtableString(str) {
	if (!str) return '';
	return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export async function getMapOptOut(clubName) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			return null;
		}

		const record = records[0];
		const venueLat = record.get('venue_lat');
		const venueLng = record.get('venue_lng');
		const venueFuzz = record.get('venue_fuzz');
		return {
			optedOut: !!record.get('map-opt-out'),
			hasLocation: venueLat !== undefined && venueLat !== null,
			venueLat: venueLat ? String(venueLat) : null,
			venueLng: venueLng ? String(venueLng) : null,
			venueFuzz: venueFuzz ?? 0
		};
	} catch (error) {
		console.error('Error getting map-opt-out from Airtable:', error);
		return null;
	}
}

export async function toggleMapOptOut(clubName) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		const currentValue = !!records[0].get('map-opt-out');
		const newValue = !currentValue;

		await base('Clubs').update(records[0].id, {
			'map-opt-out': newValue
		});
		
		console.log(`Set map-opt-out to ${newValue} for club: ${clubName}`);
		return { optedOut: newValue };
	} catch (error) {
		console.error('Error toggling map-opt-out in Airtable:', error);
		throw new Error("Failed to update map opt-out setting");
	}
}

export async function optInToMap(clubName, latitude, longitude) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		await base('Clubs').update(records[0].id, {
			'map-opt-out': false,
			'venue_lat': String(latitude),
			'venue_lng': String(longitude)
		});
		
		console.log(`Opted in club ${clubName} to map with lat: ${latitude}, lng: ${longitude}`);
		return { optedOut: false, hasLocation: true };
	} catch (error) {
		console.error('Error opting in to map in Airtable:', error);
		throw new Error("Failed to opt in to map");
	}
}

export async function updateMapSettings(clubName, { optedOut, latitude, longitude, fuzz }) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		const updateData = {
			'map-opt-out': optedOut
		};

		if (latitude !== undefined && longitude !== undefined) {
			updateData['venue_lat'] = String(latitude);
			updateData['venue_lng'] = String(longitude);
		}

		if (fuzz !== undefined) {
			updateData['venue_fuzz'] = fuzz;
		}

		await base('Clubs').update(records[0].id, updateData);
		
		console.log(`Updated map settings for club ${clubName}:`, updateData);
		return { 
			optedOut, 
			hasLocation: latitude !== undefined && longitude !== undefined,
			venueLat: latitude ? String(latitude) : null,
			venueLng: longitude ? String(longitude) : null,
			venueFuzz: fuzz ?? 0
		};
	} catch (error) {
		console.error('Error updating map settings in Airtable:', error);
		throw new Error("Failed to update map settings");
	}
}

const ALLOWED_CLUB_FIELDS = [
	'club_name',
	'club_status',
	'venue_type',
	'venue_name',
	'venue_address_line_1',
	'venue_address_city',
	'venue_address_state',
	'venue_address_country',
	'venue_address_zip',
	'Est. # of Attendees',
	'call_meeting_days',
	'call_meeting_length',
	'call_club_intrest'
];

const VENUE_TYPE_OPTIONS = ['School/College', 'Makerspace', 'Online', 'Other'];
const CLUB_STATUS_OPTIONS = ['Active', 'Dormant'];
const MEETING_DAY_OPTIONS = ['Undecided', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEETING_LENGTH_OPTIONS = ['Undecided', '30min', '45min', '60min', '90min', '120+min'];
const CLUB_INTEREST_OPTIONS = ['Web Dev', 'Game Dev', 'CAD', 'Hardware', 'Hackathons', 'Mobile App Dev, and Arduino', "Other"];

export async function getClubSettings(clubName) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			return null;
		}

		const record = records[0];
		return {
			clubName: record.get('club_name') || '',
			clubStatus: record.get('club_status') || '',
			venueType: record.get('venue_type') || '',
			venueName: record.get('venue_name') || '',
			venueAddressLine1: record.get('venue_address_line_1') || '',
			venueAddressCity: record.get('venue_address_city') || '',
			venueAddressState: record.get('venue_address_state') || '',
			venueAddressCountry: record.get('venue_address_country') || '',
			venueAddressZip: record.get('venue_address_zip') || '',
			estAttendees: record.get('Est. # of Attendees') || '',
			venueLat: record.get('venue_lat') || '',
			venueLng: record.get('venue_lng') || '',
			venueFuzz: record.get('venue_fuzz') ?? 0,
			mapOptOut: !!record.get('map-opt-out'),
			callMeetingDays: record.get('call_meeting_days') || [],
			callMeetingLength: record.get('call_meeting_length') || '',
			callClubIntrest: record.get('call_club_intrest') || []
		};
	} catch (error) {
		console.error('Error getting club settings from Airtable:', error);
		return null;
	}
}

export async function updateClubSettings(clubName, updates, currentStatus) {
	const base = getAirtableBase();
	
	const filteredUpdates = {};
	for (const [key, value] of Object.entries(updates)) {
		if (ALLOWED_CLUB_FIELDS.includes(key) && value !== undefined) {
			if (key === 'venue_type' && !VENUE_TYPE_OPTIONS.includes(value)) {
				throw new Error(`Invalid venue_type: ${value}`);
			}
			if (key === 'call_meeting_days' && Array.isArray(value)) {
				for (const day of value) {
					if (!MEETING_DAY_OPTIONS.includes(day)) {
						throw new Error(`Invalid call_meeting_days: ${day}`);
					}
				}
			}
			if (key === 'call_meeting_length' && value && !MEETING_LENGTH_OPTIONS.includes(value)) {
				throw new Error(`Invalid call_meeting_length: ${value}`);
			}
			if (key === 'call_club_intrest' && Array.isArray(value)) {
				for (const interest of value) {
					if (!CLUB_INTEREST_OPTIONS.includes(interest)) {
						throw new Error(`Invalid call_club_intrest: ${interest}`);
					}
				}
			}
			if (key === 'club_status') {
				if (!CLUB_STATUS_OPTIONS.includes(value)) {
					throw new Error(`Invalid club_status: ${value}`);
				}
				if (currentStatus !== 'Active' && value !== currentStatus) {
					throw new Error('Cannot change status of a non-active club');
				}
				if (value === 'Active' && currentStatus === 'Dormant') {
					throw new Error('Cannot reactivate a dormant club');
				}
			}
			filteredUpdates[key] = value;
		}
	}

	if (Object.keys(filteredUpdates).length === 0) {
		throw new Error('No valid fields to update');
	}

	try {
		const records = await base('Clubs').select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		await base('Clubs').update(records[0].id, filteredUpdates);
		
		console.log(`Updated club settings for ${clubName}:`, filteredUpdates);
		return { success: true, updated: Object.keys(filteredUpdates) };
	} catch (error) {
		console.error('Error updating club settings in Airtable:', error);
		throw error;
	}
}
