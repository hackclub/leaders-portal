import Airtable from 'airtable';
import { env } from '$env/dynamic/private';

export { checkLeaderEmail, getClubsForLeaderEmail as getClubsForLeader } from './clubapi.js';

export function getAirtableBase(baseId = env.AIRTABLE_BASE_ID) {
	if (!env.AIRTABLE_API_KEY) {
		throw new Error("Missing AIRTABLE_API_KEY");
	}
	if (!baseId) {
		throw new Error("Missing AIRTABLE_BASE_ID");
	}
	return new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(baseId);
}

function escapeAirtableString(str) {
	if (!str) return '';
	return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Map data (venue_lat, venue_lng, venue_fuzz, map-opt-out) lives in a separate
// Airtable base, in the "Map" table. Field names match the old Clubs columns and
// records are matched by club_name.
const MAP_BASE_ID = 'app3sG13yVpMwree2';
const MAP_TABLE = 'Map';

export async function getMapOptOut(clubName) {
	const base = getAirtableBase(MAP_BASE_ID);
	
	try {
		const records = await base(MAP_TABLE).select({
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
	const base = getAirtableBase(MAP_BASE_ID);
	
	try {
		const records = await base(MAP_TABLE).select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		const currentValue = !!records[0].get('map-opt-out');
		const newValue = !currentValue;

		await base(MAP_TABLE).update(records[0].id, {
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
	const base = getAirtableBase(MAP_BASE_ID);
	
	try {
		const records = await base(MAP_TABLE).select({
			filterByFormula: `{club_name} = "${escapeAirtableString(clubName)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			throw new Error("Club not found in Airtable");
		}

		await base(MAP_TABLE).update(records[0].id, {
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
	const base = getAirtableBase(MAP_BASE_ID);
	
	try {
		const records = await base(MAP_TABLE).select({
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

		await base(MAP_TABLE).update(records[0].id, updateData);
		
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
	'call_club_intrest',
	'club_website'
];

// Maps the portal's internal/logical field names to the Airtable column names
// in the new base. Only fields that were renamed in the new base differ; the
// rest map to themselves.
const CLUB_FIELD_TO_AIRTABLE = {
	club_name: 'club_name',
	club_status: 'status',
	venue_type: 'venue_type',
	venue_name: 'venue_name',
	venue_address_line_1: 'venue_addr_line_1',
	venue_address_city: 'venue_addr_city',
	venue_address_state: 'venue_addr_state',
	venue_address_country: 'venue_addr_country',
	venue_address_zip: 'venue_addr_zip',
	'Est. # of Attendees': 'Est. # of Attendees',
	call_meeting_days: 'call_meeting_days',
	call_meeting_length: 'call_meeting_length',
	call_club_intrest: 'call_club_intrest',
	club_website: 'club_website'
};

const VENUE_TYPE_OPTIONS = ['School/College', 'Makerspace', 'Online', 'Other'];
const CLUB_STATUS_OPTIONS = ['Active', 'Dormant', 'Pending'];
const MEETING_DAY_OPTIONS = ['Undecided', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEETING_LENGTH_OPTIONS = ['Undecided', '30min', '45min', '60min', '90min', '120+min'];
const CLUB_INTEREST_OPTIONS = ['Web Dev', 'Game Dev', 'CAD', 'Hardware', 'Hackathons', 'Mobile App Dev, and Arduino', "Other"];

export async function getClubWebsite(clubName) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Clubs').select({
			filterByFormula: `LOWER({club_name}) = LOWER("${escapeAirtableString(clubName)}")`,
			maxRecords: 1,
			fields: ['club_name', 'club_website']
		}).firstPage();

		if (records.length === 0) {
			return null;
		}

		return {
			clubName: records[0].get('club_name') || '',
			clubWebsite: records[0].get('club_website') || ''
		};
	} catch (error) {
		console.error('Error getting club website from Airtable:', error);
		return null;
	}
}

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

		// Map data lives in a separate base/table, so fetch it separately.
		const mapData = await getMapOptOut(clubName);

		const record = records[0];
		return {
			clubName: record.get('club_name') || '',
			clubStatus: record.get('status') || '',
			venueType: record.get('venue_type') || '',
			venueName: record.get('venue_name') || '',
			venueAddressLine1: record.get('venue_addr_line_1') || '',
			venueAddressCity: record.get('venue_addr_city') || '',
			venueAddressState: record.get('venue_addr_state') || '',
			venueAddressCountry: record.get('venue_addr_country') || '',
			venueAddressZip: record.get('venue_addr_zip') || '',
			estAttendees: record.get('Est. # of Attendees') || '',
			venueLat: mapData?.venueLat || '',
			venueLng: mapData?.venueLng || '',
			venueFuzz: mapData?.venueFuzz ?? 0,
			mapOptOut: !!mapData?.optedOut,
			callMeetingDays: record.get('call_meeting_days') || [],
			callMeetingLength: record.get('call_meeting_length') || '',
			callClubIntrest: record.get('call_club_intrest') || [],
			clubWebsite: record.get('club_website') || ''
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
			if (key === 'club_website') {
				if (value && typeof value === 'string' && value.trim()) {
					filteredUpdates[key] = sanitizeUrl(value);
				} else {
					filteredUpdates[key] = '';
				}
				continue;
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

		// Translate logical field names to the new base's Airtable column names.
		const airtableUpdates = {};
		for (const [key, value] of Object.entries(filteredUpdates)) {
			airtableUpdates[CLUB_FIELD_TO_AIRTABLE[key] || key] = value;
		}

		await base('Clubs').update(records[0].id, airtableUpdates);
		
		console.log(`Updated club settings for ${clubName}:`, airtableUpdates);
		return { success: true, updated: Object.keys(filteredUpdates) };
	} catch (error) {
		console.error('Error updating club settings in Airtable:', error);
		throw error;
	}
}

const ALLOWED_LEADER_FIELDS = [
	'first_name',
	'last_name',
	'pronouns',
	'gender',
	'phone_number',
	'address_line_1',
	'address_line_2',
	'address_city',
	'address_state',
	'address_country',
	'address_zip_code',
	'link_github',
	'link_personal_website',
	'link_social_media'
];

// Maps the portal's internal/logical leader field names to the Airtable column
// names in the new base. Only renamed fields differ; the rest map to themselves.
const LEADER_FIELD_TO_AIRTABLE = {
	first_name: 'name_first',
	last_name: 'name_last',
	pronouns: 'pronouns',
	gender: 'gender',
	email: 'contact_email',
	phone_number: 'contact_phone',
	address_line_1: 'lead_addr_line_1',
	address_line_2: 'lead_addr_line_2',
	address_city: 'lead_addr_city',
	address_state: 'lead_addr_state',
	address_country: 'lead_addr_country',
	address_zip_code: 'lead_addr_zip',
	link_github: 'link_github',
	link_personal_website: 'link_personal_website',
	link_social_media: 'link_social_media'
};

const PRONOUN_OPTIONS = ['he/him', 'she/her', 'they/them', 'it/its', 'any/all'];
const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary/non-confirming'];

export async function getLeaderProfile(email) {
	const base = getAirtableBase();
	
	try {
		const records = await base('Leaders').select({
			filterByFormula: `{contact_email} = "${escapeAirtableString(email)}"`,
			maxRecords: 1
		}).firstPage();

		if (records.length === 0) {
			return null;
		}

		const record = records[0];
		return {
			firstName: record.get('name_first') || '',
			lastName: record.get('name_last') || '',
			pronouns: record.get('pronouns') || '',
			gender: record.get('gender') || '',
			email: record.get('contact_email') || '',
			phoneNumber: record.get('contact_phone') || '',
			addressLine1: record.get('lead_addr_line_1') || '',
			addressLine2: record.get('lead_addr_line_2') || '',
			addressCity: record.get('lead_addr_city') || '',
			addressState: record.get('lead_addr_state') || '',
			addressCountry: record.get('lead_addr_country') || '',
			addressZipCode: record.get('lead_addr_zip') || '',
			linkGithub: record.get('link_github') || '',
			linkPersonalWebsite: record.get('link_personal_website') || '',
			linkSocialMedia: record.get('link_social_media') || ''
		};
	} catch (error) {
		console.error('Error getting leader profile from Airtable:', error);
		return null;
	}
}

function sanitizeString(value, maxLength = 500) {
	if (value === null || value === undefined) return '';
	const str = String(value).trim();
	return str.slice(0, maxLength);
}

function sanitizeUrl(url) {
	if (!url || typeof url !== 'string') return '';
	const trimmed = url.trim();
	if (!trimmed) return '';
	try {
		const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return '';
		}
		return parsed.toString();
	} catch {
		return '';
	}
}

function sanitizePhoneNumber(phone) {
	if (!phone || typeof phone !== 'string') return '';
	const cleaned = phone.replace(/[^\d+\-() ]/g, '').trim();
	return cleaned.slice(0, 30);
}

export async function updateLeaderProfile(email, updates) {
	const base = getAirtableBase();
	
	const records = await base('Leaders').select({
		filterByFormula: `{contact_email} = "${escapeAirtableString(email)}"`,
		maxRecords: 1
	}).firstPage();

	if (records.length === 0) {
		throw new Error("Leader not found in Airtable");
	}

	const filteredUpdates = {};
	
	for (const [key, value] of Object.entries(updates)) {
		if (!ALLOWED_LEADER_FIELDS.includes(key)) {
			continue;
		}
		
		if (value === undefined) {
			continue;
		}

		switch (key) {
			case 'pronouns':
				if (value === '' || value === null) {
					filteredUpdates[key] = null;
				} else if (PRONOUN_OPTIONS.includes(value)) {
					filteredUpdates[key] = value;
				} else if (typeof value === 'string' && value.length <= 50) {
					filteredUpdates[key] = sanitizeString(value, 50);
				} else {
					throw new Error(`Invalid pronouns value`);
				}
				break;
				
			case 'gender':
				if (value === '' || value === null) {
					filteredUpdates[key] = null;
				} else if (!GENDER_OPTIONS.includes(value)) {
					throw new Error(`Invalid gender: must be one of ${GENDER_OPTIONS.join(', ')}`);
				} else {
					filteredUpdates[key] = value;
				}
				break;
				
			case 'phone_number':
				filteredUpdates[key] = sanitizePhoneNumber(value);
				break;
				
			case 'link_github':
			case 'link_personal_website':
			case 'link_social_media':
				filteredUpdates[key] = sanitizeUrl(value);
				break;
				
			case 'first_name':
			case 'last_name':
				filteredUpdates[key] = sanitizeString(value, 100);
				break;
				
			case 'address_line_1':
			case 'address_line_2':
			case 'address_city':
			case 'address_state':
			case 'address_country':
			case 'address_zip_code':
				filteredUpdates[key] = sanitizeString(value, 200);
				break;
				
			default:
				filteredUpdates[key] = sanitizeString(value);
		}
	}

	if (Object.keys(filteredUpdates).length === 0) {
		throw new Error('No valid fields to update');
	}

	// Translate logical field names to the new base's Airtable column names.
	const airtableUpdates = {};
	for (const [key, value] of Object.entries(filteredUpdates)) {
		airtableUpdates[LEADER_FIELD_TO_AIRTABLE[key] || key] = value;
	}

	try {
		await base('Leaders').update(records[0].id, airtableUpdates);
		console.log(`Updated leader profile for ${email}:`, Object.keys(airtableUpdates));
		return { success: true, updated: Object.keys(filteredUpdates) };
	} catch (error) {
		console.error('Error updating leader profile in Airtable:', error);
		throw new Error("Failed to update leader profile");
	}
}

export async function createMember({ name, email, joinCode }) {
	const base = getAirtableBase();

	const cleanName = sanitizeString(name, 100);
	const cleanEmail = sanitizeString(email, 200);
	const cleanJoinCode = sanitizeString(joinCode, 100);

	if (!cleanName) {
		throw new Error('Name is required');
	}
	if (!cleanEmail) {
		throw new Error('Email is required');
	}
	if (!cleanJoinCode) {
		throw new Error('Join Code is required');
	}

	try {
		const records = await base('Members').create([
			{
				fields: {
					Name: cleanName,
					Email: cleanEmail,
					'Join Code': cleanJoinCode
				}
			}
		]);

		console.log(`Created member ${cleanName} (${cleanEmail}) with join code ${cleanJoinCode}`);
		return { success: true, id: records[0]?.id };
	} catch (error) {
		console.error('Error creating member in Airtable:', error);
		throw new Error('Failed to create member');
	}
}

export async function checkMemberEmail(email) {
	const base = getAirtableBase();

	try {
		const records = await base('Members').select({
			filterByFormula: `LOWER({Email}) = LOWER("${escapeAirtableString(email)}")`,
			maxRecords: 1,
			fields: ['Name', 'Email']
		}).firstPage();

		if (records.length === 0) {
			return { isMember: false, name: null };
		}

		return {
			isMember: true,
			name: records[0].get('Name') || null
		};
	} catch (error) {
		console.error('Error checking member email in Airtable:', error);
		return { isMember: false, name: null };
	}
}

/**
 * Get the club name a member belongs to, using the `club_name` field on the
 * Members table in Airtable. Returns null if the member or field is missing.
 * @param {string} email
 * @returns {Promise<string | null>}
 */
export async function getMemberClubName(email) {
	if (!email) return null;
	const base = getAirtableBase();

	try {
		const records = await base('Members').select({
			filterByFormula: `LOWER({Email}) = LOWER("${escapeAirtableString(email)}")`,
			maxRecords: 1,
			fields: ['club_name']
		}).firstPage();

		if (records.length === 0) {
			return null;
		}

		const clubName = records[0].get('club_name');
		// club_name may be a linked-record array or a plain string.
		if (Array.isArray(clubName)) {
			return clubName[0] || null;
		}
		return clubName || null;
	} catch (error) {
		console.error('Error getting member club name from Airtable:', error);
		return null;
	}
}

// New function to get club leaders
export async function getClubLeaders(clubName) {
	const base = getAirtableBase();
	
	try {
		// Wrap each joined club name in "|" delimiters so we match a whole
		// club name rather than a substring (e.g. "Forge" must not match
		// "CyberForge").
		const records = await base('Leaders').select({
			filterByFormula: `AND(SEARCH("|${escapeAirtableString(clubName)}|", "|" & ARRAYJOIN({club_name (from rel_clubs)}, "|") & "|") > 0, {type} = "Main")`
		}).all();

		return records.map(record => {
			const firstName = record.get('name_first') || '';
			const lastName = record.get('name_last') || '';
			const email = record.get('contact_email') || '';
			const fullName = `${firstName} ${lastName}`.trim();
			return {
				// Fall back to the email when the leader has no name set in Airtable
				name: fullName || email.split('@')[0] || 'Leader',
				email,
				isPrimary: true
			};
		});
	} catch (error) {
		console.error('Error getting club leaders from Airtable:', error);
		return [];
	}
}

export async function getColeaders(clubName) {
	const base = getAirtableBase();
	
	try {
		// Wrap each joined club name in "|" delimiters so we match a whole
		// club name rather than a substring (e.g. "Forge" must not match
		// "CyberForge").
		const records = await base('Leaders').select({
			filterByFormula: `AND(SEARCH("|${escapeAirtableString(clubName)}|", "|" & ARRAYJOIN({club_name (from rel_clubs)}, "|") & "|") > 0, {type} = "Co-Lead")`
		}).all();

		return records.map(record => {
			const firstName = record.get('name_first') || '';
			const lastName = record.get('name_last') || '';
			const email = record.get('contact_email') || '';
			const fullName = `${firstName} ${lastName}`.trim();
			return {
				// Fall back to the email when the leader has no name set in Airtable
				name: fullName || email.split('@')[0] || 'Leader',
				email,
				isPrimary: false
			};
		});
	} catch (error) {
		console.error('Error getting club leaders from Airtable:', error);
		return [];
	}
}