export async function up(knex) {
	await knex.schema.createTable('club_join_page_colors', (t) => {
		t.increments('id').primary();
		t.text('club_name').notNullable().unique();
		t.text('bg_color');
		t.text('card_color');
		t.text('text_color');
		t.text('button_color');
		t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
		t.index(['club_name']);
	});
}

export async function down(knex) {
	await knex.schema.dropTableIfExists('club_join_page_colors');
}
