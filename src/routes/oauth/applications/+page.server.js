import { fail, redirect } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import {
	createOAuthApplication,
	deleteOAuthApplicationByOwner,
	listOAuthApplicationsForOwner,
	parseApplicationScopes,
	parseStoredRedirectUris,
	rotateOAuthApplicationSecret,
	updateOAuthApplicationByOwner,
	findOAuthApplicationById
} from '$lib/server/oauth/store.js';
import {
	OAUTH_SCOPES,
	DEFAULT_OAUTH_SCOPES,
	getUnknownScopes,
	hasSensitiveScopes
} from '$lib/server/oauth/scopes.js';

function readRequestedScopes(formData) {
	const selectedScopes = formData.getAll('scopes').map((scope) => scope.toString());
	if (selectedScopes.length === 0) {
		return [...DEFAULT_OAUTH_SCOPES];
	}
	return selectedScopes;
}

function mapAppForView(app) {
	return {
		...app,
		redirectUris: parseStoredRedirectUris(app.redirect_uris),
		scopeList: parseApplicationScopes(app.scopes)
	};
}

export async function load({ locals }) {
	if (!locals.userId) {
		throw redirect(302, '/email-login');
	}

	const knex = getKnex();
	const apps = await listOAuthApplicationsForOwner(knex, locals.userId);

	return {
		apps: apps.map(mapAppForView),
		scopes: OAUTH_SCOPES
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.userId) {
			throw redirect(302, '/email-login');
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || '';
		const redirectUris = formData.get('redirectUris')?.toString() || '';
		const confidential = formData.get('confidential') === 'on';
		const scopes = readRequestedScopes(formData);

		if (!name) {
			return fail(400, { createError: 'App name is required' });
		}

		const unknownScopes = getUnknownScopes(scopes);
		if (unknownScopes.length > 0) {
			return fail(400, { createError: `Unknown scopes requested: ${unknownScopes.join(', ')}` });
		}

		if (hasSensitiveScopes(scopes)) {
			return fail(400, {
				createError: 'Sensitive scopes require a verified application. Send your client ID in #leaders, ask for the required scopes and explain why you need them.'
			});
		}

		try {
			const knex = getKnex();
			const { row, clientSecret } = await createOAuthApplication(knex, {
				ownerUserId: locals.userId,
				name,
				description,
				redirectUris,
				scopes,
				confidential
			});

			return {
				created: true,
				createdAppId: row.id,
				clientId: row.client_id,
				clientSecret: clientSecret || null
			};
		} catch (err) {
			return fail(400, { createError: err.message || 'Failed to create OAuth application' });
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.userId) {
			throw redirect(302, '/email-login');
		}

		const formData = await request.formData();
		const applicationId = formData.get('applicationId')?.toString();
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || '';
		const redirectUris = formData.get('redirectUris')?.toString() || '';
		const confidential = formData.get('confidential') === 'on';
		const scopes = readRequestedScopes(formData);

		if (!applicationId) {
			return fail(400, { updateError: 'Missing application id' });
		}
		if (!name) {
			return fail(400, { updateError: 'App name is required' });
		}

		const unknownScopes = getUnknownScopes(scopes);
		if (unknownScopes.length > 0) {
			return fail(400, { updateError: `Unknown scopes requested: ${unknownScopes.join(', ')}` });
		}

		const knex = getKnex();
		const existing = await findOAuthApplicationById(knex, applicationId);
		if (!existing || existing.owner_user_id !== locals.userId) {
			return fail(404, { updateError: 'OAuth application not found' });
		}

		if (!existing.verified && hasSensitiveScopes(scopes)) {
			return fail(400, {
				updateError: 'Sensitive scopes are available only after an admin verifies your app'
			});
		}

		try {
			const row = await updateOAuthApplicationByOwner(knex, {
				applicationId,
				ownerUserId: locals.userId,
				name,
				description,
				redirectUris,
				scopes,
				confidential
			});

			if (!row) {
				return fail(404, { updateError: 'OAuth application not found' });
			}

			return { updated: true, updatedAppId: applicationId };
		} catch (err) {
			return fail(400, { updateError: err.message || 'Failed to update OAuth application' });
		}
	},

	rotateSecret: async ({ request, locals }) => {
		if (!locals.userId) {
			throw redirect(302, '/email-login');
		}

		const formData = await request.formData();
		const applicationId = formData.get('applicationId')?.toString();
		if (!applicationId) {
			return fail(400, { rotateError: 'Missing application id' });
		}

		const knex = getKnex();
		const result = await rotateOAuthApplicationSecret(knex, {
			applicationId,
			ownerUserId: locals.userId
		});

		if (!result) {
			return fail(400, { rotateError: 'Could not rotate secret for this application' });
		}

		return {
			rotated: true,
			rotatedAppId: applicationId,
			clientSecret: result.clientSecret
		};
	},

	delete: async ({ request, locals }) => {
		if (!locals.userId) {
			throw redirect(302, '/email-login');
		}

		const formData = await request.formData();
		const applicationId = formData.get('applicationId')?.toString();
		if (!applicationId) {
			return fail(400, { deleteError: 'Missing application id' });
		}

		const knex = getKnex();
		const deleted = await deleteOAuthApplicationByOwner(knex, {
			applicationId,
			ownerUserId: locals.userId
		});

		if (!deleted) {
			return fail(404, { deleteError: 'OAuth application not found' });
		}

		return { deleted: true, deletedAppId: applicationId };
	}
};
