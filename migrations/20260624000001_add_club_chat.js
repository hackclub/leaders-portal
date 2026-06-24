export async function up(knex) {
	await knex.schema.createTable('club_chat_messages', (t) => {
		t.increments('id').primary();
		t.text('club_name').notNullable();
		t.text('sender_name').notNullable();
		t.text('sender_email').notNullable();
		t.boolean('is_leader').notNullable().defaultTo(false);
		t.text('message').notNullable();
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['club_name']);
		t.index(['created_at']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('club_chat_messages');
}
