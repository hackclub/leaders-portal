export async function up(knex) {
	await knex.schema.createTable('clubs', (t) => {
		t.uuid('id').primary();
		t.integer('provider_club_id').notNullable().unique();
		t.text('name').notNullable();
		t.text('description');
		t.text('location');
		t.integer('member_count');
		t.decimal('balance', 10, 2);
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['provider_club_id']);
	});

	await knex.schema.createTable('user_clubs', (t) => {
		t.uuid('id').primary();
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
		t.uuid('club_id').references('clubs.id').onDelete('CASCADE').notNullable();
		t.text('role').notNullable();
		t.timestamp('joined_at', { useTz: true });
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.unique(['user_id', 'club_id']);
		t.index(['user_id']);
		t.index(['club_id']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('user_clubs');
	await knex.schema.dropTableIfExists('clubs');
}
