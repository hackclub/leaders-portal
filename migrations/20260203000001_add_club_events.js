/**
 * Migration to add club_events table for club leaders to manage their own events
 */

export function up(knex) {
	return knex.schema.createTable('club_events', function(table) {
		table.increments('id').primary();
		table.string('club_name').notNullable().index();
		table.string('title').notNullable();
		table.text('description');
		table.date('event_date').notNullable().index();
		table.time('event_time');
		table.string('location');
		table.string('created_by');
		table.timestamp('created_at').defaultTo(knex.fn.now());
		table.timestamp('updated_at');
	});
}

export function down(knex) {
	return knex.schema.dropTableIfExists('club_events');
}
