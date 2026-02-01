import { error } from '@sveltejs/kit';
import { getClubWebsite } from '$lib/server/airtable.js';

function isValidRedirectUrl(url) {
	if (!url || typeof url !== 'string') return false;
	
	try {
		const parsed = new URL(url);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			return false;
		}
		if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

export async function load({ params }) {
	const clubName = decodeURIComponent(params.club).replace(/-/g, ' ');
	
	const club = await getClubWebsite(clubName);
	
	if (!club) {
		throw error(404, 'Club not found');
	}
	
	if (!club.clubWebsite) {
		throw error(404, 'This club does not have a website configured');
	}
	
	if (!isValidRedirectUrl(club.clubWebsite)) {
		throw error(400, 'Invalid club website URL');
	}
	
	return {
		clubName: club.clubName,
		clubWebsite: club.clubWebsite
	};
}
