export async function up(knex) {
	await knex.schema.createTable('event_rsvps', (t) => {
		t.increments('id').primary();
		t.integer('event_id').notNullable().references('club_events.id').onDelete('CASCADE');
		t.text('member_email').notNullable();
		t.text('member_name');
		t.text('status').notNullable().defaultTo('going');
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.unique(['event_id', 'member_email']);
		t.index(['event_id']);
		t.index(['member_email']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('event_rsvps');
}
