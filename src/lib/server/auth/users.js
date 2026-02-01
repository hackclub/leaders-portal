import crypto from 'node:crypto';

export async function upsertUserFromProvider(knex, data) {
	const existing = await knex('users')
		.where({ provider: 'hackclub', provider_user_id: data.provider_user_id })
		.first();

	if (existing) {
		await knex('users')
			.where({ id: existing.id })
			.update({
				username: data.username,
				email: data.email,
				first_name: data.first_name,
				last_name: data.last_name,
				identity_verified: data.identity_verified,
				updated_at: new Date()
			});
		return await knex('users').where({ id: existing.id }).first();
	}

	const [row] = await knex('users')
		.insert({
			id: crypto.randomUUID(),
			provider: 'hackclub',
			provider_user_id: data.provider_user_id,
			username: data.username,
			email: data.email,
			first_name: data.first_name,
			last_name: data.last_name,
			identity_verified: data.identity_verified
		})
		.returning('*');
	return row;
}

export async function getUserPublicById(knex, userId) {
	const u = await knex('users').where({ id: userId }).first();
	if (!u) return null;
	return {
		id: u.id,
		username: u.username,
		firstName: u.first_name,
		lastName: u.last_name,
		email: u.email,
		identityVerified: u.identity_verified,
		isAdmin: !!u.is_admin,
		isSuspended: !!u.is_suspended,
		suspensionReason: u.suspension_reason || null,
		suspendedAt: u.suspended_at || null,
		provider: u.provider,
		hackclubAuthId: u.hackclub_auth_id || null,
		hackclubPrimaryEmail: u.hackclub_primary_email || null,
		hackclubSlackId: u.hackclub_slack_id || null
	};
}

export async function getEffectiveEmail(knex, userId) {
	const u = await knex('users').where({ id: userId }).first();
	if (!u) return null;
	if (u.provider === 'hackclub_auth' && u.hackclub_primary_email) {
		return u.hackclub_primary_email;
	}
	return u.email;
}
