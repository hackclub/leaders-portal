import { json, error } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { requireOAuthAccess } from '$lib/server/oauth/authenticate.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';
import { createMember, deleteMember } from '$lib/server/clubapi.js';

function getEffectiveEmailFromOAuthUser(user) {
	if (user.provider === 'hackclub_auth' && user.hackclubPrimaryEmail) {
		return user.hackclubPrimaryEmail;
	}
	return user.email;
}

async function getAuthorizedClub(request, params) {
	const knex = getKnex();
	const context = await requireOAuthAccess(knex, request, ['clubs:members:write']);
	const effectiveEmail = getEffectiveEmailFromOAuthUser(context.user);
	if (!effectiveEmail) throw error(400, 'No leader email available');

	const clubs = await getClubsForEmail(effectiveEmail);
	const clubName = decodeURIComponent(params.club);
	const club = clubs.find((candidate) => candidate.name === clubName);
	if (!club) throw error(403, 'No access to this club');

	return { club, clubName };
}

export async function POST({ request, params }) {
	const { club, clubName } = await getAuthorizedClub(request, params);

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const name = body?.name?.toString().trim();
	const emailValue = body?.email?.toString().trim();
	if (!name || !emailValue) {
		throw error(400, 'Both name and email are required');
	}

	if (!club.joinCode) {
		throw error(400, 'This club does not have a join code');
	}

	const created = await createMember(name, emailValue, club.joinCode);
	return json({ success: true, club: clubName, member: created });
}

export async function DELETE({ request, params }) {
	const { clubName } = await getAuthorizedClub(request, params);

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const memberName = body?.memberName?.toString().trim();
	if (!memberName) {
		throw error(400, 'memberName is required');
	}

	await deleteMember(memberName, clubName);
	return json({ success: true, club: clubName, removed: memberName });
}
