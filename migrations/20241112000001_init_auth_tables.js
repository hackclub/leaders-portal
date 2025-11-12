export async function up(knex) {
	await knex.schema.createTable('users', (t) => {
		t.uuid('id').primary();
		t.text('provider').notNullable().defaultTo('hackclub');
		t.text('provider_user_id').notNullable();
		t.text('username');
		t.text('email');
		t.text('first_name');
		t.text('last_name');
		t.boolean('identity_verified').notNullable().defaultTo(false);
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.unique(['provider', 'provider_user_id']);
		t.index(['email']);
		t.index(['username']);
	});

	await knex.schema.createTable('sessions', (t) => {
		t.uuid('id').primary();
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
		t.string('session_token_hash', 64).notNullable().unique();
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('last_activity_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('expires_at', { useTz: true }).notNullable();
		t.specificType('ip', 'inet');
		t.text('user_agent');
		t.index(['user_id']);
		t.index(['expires_at']);
	});

	await knex.schema.createTable('oauth_tokens', (t) => {
		t.uuid('id').primary();
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable().unique();
		t.text('provider').notNullable().defaultTo('hackclub');
		t.binary('access_token_ciphertext').notNullable();
		t.binary('access_token_iv').notNullable();
		t.binary('access_token_tag').notNullable();
		t.binary('refresh_token_ciphertext').notNullable();
		t.binary('refresh_token_iv').notNullable();
		t.binary('refresh_token_tag').notNullable();
		t.text('token_type');
		t.text('scope_requested');
		t.text('scope_granted');
		t.timestamp('access_token_expires_at', { useTz: true }).notNullable();
		t.smallint('key_version').notNullable().defaultTo(1);
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.unique(['user_id', 'provider']);
		t.index(['access_token_expires_at']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('oauth_tokens');
	await knex.schema.dropTableIfExists('sessions');
	await knex.schema.dropTableIfExists('users');
}
