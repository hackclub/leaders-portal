export async function up(knex) {
	await knex.schema.createTable('club_announcements', (t) => {
		t.increments('id').primary();
		t.text('club_name').notNullable();
		t.text('message').notNullable();
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['club_name']);
		t.index(['created_at']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('club_announcements');
}
