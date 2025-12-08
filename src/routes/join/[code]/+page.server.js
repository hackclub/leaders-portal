import { getClubByCode } from '$lib/server/clubapi.js';

export async function load({ params }) {
	const { code } = params;
	const club = await getClubByCode(code);
	
	return {
		code,
		clubName: club?.fields?.club_name || club?.club_name || null
	};
}
