import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { requireOAuthAccess } from '$lib/server/oauth/authenticate.js';
import { getClubsForEmail } from '$lib/server/sync-clubs.js';

function getEffectiveEmailFromOAuthUser(user) {
	if (user.provider === 'hackclub_auth' && user.hackclubPrimaryEmail) {
		return user.hackclubPrimaryEmail;
	}
	return user.email;
}

function hasScope(scopes, target) {
	return scopes.includes(target);
}

export async function GET({ request }) {
	const knex = getKnex();
	const context = await requireOAuthAccess(knex, request, ['clubs:read']);
	const effectiveEmail = getEffectiveEmailFromOAuthUser(context.user);
	const clubs = effectiveEmail ? await getClubsForEmail(effectiveEmail) : [];

	const includeShips = hasScope(context.scopes, 'clubs:ships:read') || hasScope(context.scopes, 'clubs:read');
	const includeMembers = hasScope(context.scopes, 'clubs:members:read');

	const payload = clubs.map((club) => {
		const result = {
			id: club.id,
			name: club.name,
			level: club.level,
			location: club.location,
			joinCode: club.joinCode,
			role: club.role,
			cachedAt: club.cachedAt || null
		};

		if (includeShips) {
			result.ships = club.ships || [];
		}

		if (includeMembers) {
			result.members = club.members || [];
		}

		return result;
	});

	return json({
		clubs: payload,
		totalClubs: payload.length,
		application: context.application,
		scopes: context.scopes
	});
}
