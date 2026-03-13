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

export async function GET({ request }) {
	const knex = getKnex();
	const context = await requireOAuthAccess(knex, request, ['leader:read']);
	const effectiveEmail = getEffectiveEmailFromOAuthUser(context.user);
	const clubs = effectiveEmail ? await getClubsForEmail(effectiveEmail) : [];

	return json({
		leader: {
			id: context.user.id,
			firstName: context.user.firstName,
			lastName: context.user.lastName,
			email: effectiveEmail,
			slackId: context.user.hackclubSlackId,
			identityVerified: !!context.user.identityVerified,
			isLeader: clubs.length > 0
		},
		application: context.application,
		scopes: context.scopes
	});
}
