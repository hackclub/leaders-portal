import { env } from '$env/dynamic/private';

const CLUB_API_BASE = 'https://clubapi.hackclub.com';

async function fetchClubApi(endpoint, params = {}) {
	const url = new URL(endpoint, CLUB_API_BASE);
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	const headers = {};
	if (env.CLUB_API_KEY) {
		headers['Authorization'] = env.CLUB_API_KEY;
	}

	console.log('[ClubAPI] Fetching:', url.toString());
	console.log('[ClubAPI] Has API key:', !!env.CLUB_API_KEY);

	try {
		const response = await fetch(url.toString(), { headers });
		console.log('[ClubAPI] Response status:', response.status, response.statusText);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('[ClubAPI] Error response body:', errorText);
			throw new Error(`Club API error: ${response.status} ${response.statusText}`);
		}
		
		const data = await response.json();
		console.log('[ClubAPI] Response data:', JSON.stringify(data).slice(0, 500));
		return data;
	} catch (error) {
		console.error('[ClubAPI] Fetch error:', error.message);
		throw error;
	}
}

export async function getLeaderByEmail(email) {
	console.log('[ClubAPI] getLeaderByEmail called with:', email);
	try {
		const data = await fetchClubApi('/leader', { email });
		console.log('[ClubAPI] getLeaderByEmail result:', data);
		return data;
	} catch (error) {
		console.error('[ClubAPI] getLeaderByEmail error:', error);
		return null;
	}
}

export async function checkLeaderEmail(email) {
	console.log('[ClubAPI] checkLeaderEmail called with:', email);
	try {
		const data = await fetchClubApi('/leader', { email });
		const isLeader = data.leader === true || !!data.club_name;
		console.log('[ClubAPI] checkLeaderEmail result:', isLeader, 'data:', data);
		return isLeader;
	} catch (error) {
		console.error('[ClubAPI] checkLeaderEmail error:', error);
		return false;
	}
}

export async function getClubByName(clubName) {
	try {
		const data = await fetchClubApi('/club', { name: clubName });
		return data;
	} catch (error) {
		console.error(`Error fetching club ${clubName}:`, error);
		return null;
	}
}

export async function getClubByCode(code) {
	try {
		const data = await fetchClubApi('/club/code', { code });
		return data;
	} catch (error) {
		console.error(`Error fetching club by code ${code}:`, error);
		return null;
	}
}

export async function getClubLevel(clubName) {
	try {
		const data = await fetchClubApi('/level', { club_name: clubName });
		return data.fields?.level || data.level || null;
	} catch (error) {
		console.error(`Error fetching level for club ${clubName}:`, error);
		return null;
	}
}

function sanitizeUrl(url) {
	if (!url || typeof url !== 'string') return null;
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null;
		}
		return parsed.toString();
	} catch {
		return null;
	}
}

export async function getClubShips(clubName) {
	try {
		const data = await fetchClubApi('/ships', { club_name: clubName });
		console.log('[ClubAPI] getClubShips raw data:', JSON.stringify(data, null, 2));
		if (!Array.isArray(data)) {
			return [];
		}
		return data.map((ship) => {
			const fields = ship.fields || ship;
			console.log('[ClubAPI] Ship fields:', JSON.stringify(fields, null, 2));
			return {
				name: fields['YSWS–Name (from Unified YSWS Database)']?.[0] || fields.name || 'Unnamed Ship',
				codeUrl: sanitizeUrl(fields.code_url),
				memberName: fields.member_name || null
			};
		});
	} catch (error) {
		console.error(`Error fetching ships for club ${clubName}:`, error);
		return [];
	}
}

export async function getClubMembers(clubName) {
	try {
		const data = await fetchClubApi('/members', { club_name: clubName });
		console.log('[ClubAPI] getClubMembers raw data:', JSON.stringify(data, null, 2));
		return data.members || null;
	} catch (error) {
		console.error(`Error fetching members for club ${clubName}:`, error);
		return null;
	}
}

export async function deleteMember(memberName, clubName) {
	const url = new URL('/member', CLUB_API_BASE);
	url.searchParams.append('name', memberName);
	if (clubName) {
		url.searchParams.append('club_name', clubName);
	}

	const headers = {};
	if (env.CLUB_API_KEY) {
		headers['Authorization'] = env.CLUB_API_KEY;
	}

	console.log('[ClubAPI] Deleting member:', memberName, 'from club:', clubName);

	const response = await fetch(url.toString(), {
		method: 'DELETE',
		headers
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('[ClubAPI] Delete member error:', errorText);
		throw new Error(`Failed to delete member: ${response.status}`);
	}

	const data = await response.json();
	console.log('[ClubAPI] Delete member result:', data);
	return data;
}

export async function sendAnnouncement(clubName, message) {
	const url = new URL('/announce', CLUB_API_BASE);
	url.searchParams.append('club', clubName);
	url.searchParams.append('message', message);

	const headers = {};
	if (env.CLUB_API_KEY) {
		headers['Authorization'] = env.CLUB_API_KEY;
	}

	console.log('[ClubAPI] Sending announcement to club:', clubName);

	const response = await fetch(url.toString(), {
		method: 'POST',
		headers
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('[ClubAPI] Send announcement error:', errorText);
		throw new Error(`Failed to send announcement: ${response.status}`);
	}

	const data = await response.json();
	console.log('[ClubAPI] Send announcement result:', data);
	return data;
}

export async function getMember(memberName) {
	try {
		const data = await fetchClubApi('/member', { name: memberName });
		return data;
	} catch (error) {
		console.error(`Error fetching member ${memberName}:`, error);
		return null;
	}
}

export async function updateMember(memberName, newName, newEmail) {
	const url = new URL('/member', CLUB_API_BASE);
	url.searchParams.append('name', memberName);
	if (newName) {
		url.searchParams.append('new_name', newName);
	}
	if (newEmail) {
		url.searchParams.append('new_email', newEmail);
	}

	const headers = {};
	if (env.CLUB_API_KEY) {
		headers['Authorization'] = env.CLUB_API_KEY;
	}

	console.log('[ClubAPI] Updating member:', memberName, 'newName:', newName, 'newEmail:', newEmail);

	const response = await fetch(url.toString(), {
		method: 'POST',
		headers
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('[ClubAPI] Update member error:', errorText);
		throw new Error(`Failed to update member: ${response.status}`);
	}

	const data = await response.json();
	console.log('[ClubAPI] Update member result:', data);
	return data;
}

export async function createMember(name, email, joinCode) {
	const url = new URL('/member/create', CLUB_API_BASE);
	url.searchParams.append('name', name);
	url.searchParams.append('email', email);
	url.searchParams.append('join_code', joinCode);

	const headers = {};
	if (env.CLUB_API_KEY) {
		headers['Authorization'] = env.CLUB_API_KEY;
	}

	console.log('[ClubAPI] Creating member:', name, 'email:', email, 'joinCode:', joinCode);

	const response = await fetch(url.toString(), {
		method: 'POST',
		headers
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('[ClubAPI] Create member error:', errorText);
		throw new Error(`Failed to create member: ${response.status}`);
	}

	const data = await response.json();
	console.log('[ClubAPI] Create member result:', data);
	return data;
}

export async function getClubsForLeaderEmail(email) {
	console.log('[ClubAPI] getClubsForLeaderEmail called with:', email);
	try {
		const leaderData = await getLeaderByEmail(email);
		console.log('[ClubAPI] getClubsForLeaderEmail leaderData:', leaderData);
		if (!leaderData || !leaderData.club_name) {
			console.log('[ClubAPI] getClubsForLeaderEmail: No leader data or club_name found');
			return [];
		}

		const clubNames = Array.isArray(leaderData.club_name) 
			? leaderData.club_name 
			: [leaderData.club_name];
		console.log('[ClubAPI] getClubsForLeaderEmail clubNames:', clubNames);

		const clubs = await Promise.all(
			clubNames.map(async (clubName) => {
				const [clubInfo, level] = await Promise.all([
					getClubByName(clubName),
					getClubLevel(clubName)
				]);
				console.log('[ClubAPI] Club info for', clubName, ':', clubInfo, 'level:', level);
				return {
					id: clubInfo?.id || clubInfo?.fields?.id || clubName,
					name: clubName,
					level: level || clubInfo?.fields?.level || clubInfo?.level || null,
					description: null,
					location: clubInfo?.fields?.venue_address_country || clubInfo?.venue_address_country || null,
					role: 'leader',
					joinCode: clubInfo?.fields?.['Join Code'] || clubInfo?.['Join Code'] || null
				};
			})
		);

		console.log('[ClubAPI] getClubsForLeaderEmail result:', clubs);
		return clubs;
	} catch (error) {
		console.error('[ClubAPI] getClubsForLeaderEmail error:', error);
		return [];
	}
}
