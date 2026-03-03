import { error } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import {
	listOAuthApplications,
	parseApplicationScopes,
	parseStoredRedirectUris,
	setOAuthApplicationVerified
} from '$lib/server/oauth/store.js';

function mapApplication(app) {
	return {
		...app,
		redirectUris: parseStoredRedirectUris(app.redirect_uris),
		scopeList: parseApplicationScopes(app.scopes)
	};
}

export async function load({ locals }) {
	if (!locals.userPublic?.isAdmin) {
		throw error(403, 'Forbidden');
	}

	const knex = getKnex();
	const apps = await listOAuthApplications(knex);
	const ownerIds = [...new Set(apps.map((app) => app.owner_user_id).filter(Boolean))];
	const owners = ownerIds.length
		? await knex('users')
				.whereIn('id', ownerIds)
				.select('id', 'email', 'first_name', 'last_name', 'username')
		: [];

	const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

	return {
		apps: apps.map((app) => ({
			...mapApplication(app),
			owner: app.owner_user_id ? ownerById.get(app.owner_user_id) || null : null
		}))
	};
}

export const actions = {
	toggleVerified: async ({ request, locals }) => {
		if (!locals.userPublic?.isAdmin) {
			throw error(403, 'Forbidden');
		}

		const formData = await request.formData();
		const applicationId = formData.get('applicationId')?.toString();
		const verified = formData.get('verified') === 'true';

		if (!applicationId) {
			throw error(400, 'Missing application id');
		}

		const knex = getKnex();
		const updated = await setOAuthApplicationVerified(knex, {
			applicationId,
			verified: !verified
		});

		if (!updated) {
			throw error(404, 'OAuth application not found');
		}

		return { success: true, applicationId, verified: updated.verified };
	}
};
