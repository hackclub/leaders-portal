export async function up(knex) {
	await knex.schema.createTable('user_completed_events', (t) => {
		t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
		t.text('event_id').notNullable();
		t.timestamp('completed_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.unique(['user_id', 'event_id']);
		t.index(['user_id']);
		t.index(['event_id']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('user_completed_events');
}
