export async function up(knex) {
	// Add suspension fields to users table
	await knex.schema.alterTable('users', (t) => {
		t.boolean('is_suspended').notNullable().defaultTo(false);
		t.text('suspension_reason');
		t.timestamp('suspended_at', { useTz: true });
		t.uuid('suspended_by');
	});

	// Create suspended_clubs table
	await knex.schema.createTable('suspended_clubs', (t) => {
		t.uuid('id').primary();
		t.integer('provider_club_id').notNullable().unique();
		t.text('club_name').notNullable();
		t.text('reason');
		t.uuid('suspended_by');
		t.timestamp('suspended_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['provider_club_id']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('suspended_clubs');
	
	await knex.schema.alterTable('users', (t) => {
		t.dropColumn('is_suspended');
		t.dropColumn('suspension_reason');
		t.dropColumn('suspended_at');
		t.dropColumn('suspended_by');
	});
}
