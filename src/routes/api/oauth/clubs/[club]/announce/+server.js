import { json, error } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { requireOAuthAccess } from '$lib/server/oauth/authenticate.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';
import { sendAnnouncement } from '$lib/server/clubapi.js';

function getEffectiveEmailFromOAuthUser(user) {
	if (user.provider === 'hackclub_auth' && user.hackclubPrimaryEmail) {
		return user.hackclubPrimaryEmail;
	}
	return user.email;
}

export async function POST({ request, params }) {
	const knex = getKnex();
	const context = await requireOAuthAccess(knex, request, ['clubs:announce']);
	const effectiveEmail = getEffectiveEmailFromOAuthUser(context.user);
	if (!effectiveEmail) throw error(400, 'No leader email available');

	const clubs = await getClubsForEmail(effectiveEmail);
	const clubName = decodeURIComponent(params.club);
	const club = clubs.find((candidate) => candidate.name === clubName);
	if (!club) throw error(403, 'No access to this club');

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const message = body?.message?.toString().trim();
	if (!message) throw error(400, 'Message is required');
	if (message.length > 1000) throw error(400, 'Message too long (max 1000 characters)');

	const result = await sendAnnouncement(clubName, message);
	return json({
		success: true,
		club: clubName,
		membersUpdated: result?.membersUpdated ?? null
	});
}
