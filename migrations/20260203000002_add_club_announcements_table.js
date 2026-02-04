/**
 * Migration to add club_announcements table for club leaders to manage their announcements
 */

export async function up(knex) {
	const exists = await knex.schema.hasTable('club_announcements');
	if (!exists) {
		return knex.schema.createTable('club_announcements', function(table) {
			table.increments('id').primary();
			table.string('club_id').notNullable().index();
			table.string('subject');
			table.text('message').notNullable();
			table.uuid('sent_by');
			table.integer('member_count').defaultTo(0);
			table.timestamp('created_at').defaultTo(knex.fn.now());
		});
	}
}

export function down(knex) {
	return knex.schema.dropTableIfExists('club_announcements');
}
