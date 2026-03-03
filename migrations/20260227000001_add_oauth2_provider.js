export async function up(knex) {
	await knex.schema.createTable('oauth_applications', (t) => {
		t.uuid('id').primary();
		t.uuid('owner_user_id').references('users.id').onDelete('SET NULL').nullable();
		t.text('name').notNullable();
		t.text('description').nullable();
		t.text('client_id').notNullable().unique();
		t.text('client_secret_hash').nullable();
		t.text('redirect_uris').notNullable(); // JSON array
		t.text('scopes').notNullable().defaultTo('');
		t.boolean('confidential').notNullable().defaultTo(true);
		t.boolean('verified').notNullable().defaultTo(false);
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['owner_user_id']);
		t.index(['verified']);
	});

	await knex.schema.createTable('oauth_authorization_codes', (t) => {
		t.uuid('id').primary();
		t.uuid('application_id').references('oauth_applications.id').onDelete('CASCADE').notNullable();
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
		t.string('code_hash', 64).notNullable().unique();
		t.text('redirect_uri').notNullable();
		t.text('scopes').notNullable();
		t.timestamp('expires_at', { useTz: true }).notNullable();
		t.timestamp('used_at', { useTz: true }).nullable();
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['application_id']);
		t.index(['user_id']);
		t.index(['expires_at']);
	});

	await knex.schema.createTable('oauth_access_tokens', (t) => {
		t.uuid('id').primary();
		t.uuid('application_id').references('oauth_applications.id').onDelete('CASCADE').notNullable();
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
		t.string('token_hash', 64).notNullable().unique();
		t.string('refresh_token_hash', 64).nullable().unique();
		t.text('scopes').notNullable();
		t.timestamp('expires_at', { useTz: true }).notNullable();
		t.timestamp('revoked_at', { useTz: true }).nullable();
		t.timestamp('last_used_at', { useTz: true }).nullable();
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['application_id']);
		t.index(['user_id']);
		t.index(['expires_at']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('oauth_access_tokens');
	await knex.schema.dropTableIfExists('oauth_authorization_codes');
	await knex.schema.dropTableIfExists('oauth_applications');
}
