export async function up(knex) {
	await knex.schema.createTable('admin_impersonation_audit', (t) => {
		t.uuid('id').primary();
		t.uuid('admin_user_id').references('users.id').onDelete('SET NULL');
		t.text('admin_email').notNullable();
		t.uuid('target_user_id').references('users.id').onDelete('SET NULL');
		t.text('target_email').notNullable();
		t.uuid('admin_session_id').notNullable();
		t.uuid('impersonated_session_id').notNullable();
		t.specificType('ip', 'inet');
		t.text('user_agent');
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['admin_user_id']);
		t.index(['target_user_id']);
		t.index(['created_at']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('admin_impersonation_audit');
}
