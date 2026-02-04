/**
 * Migration to add club_slug column to club_events table
 * This allows members who joined via join code to see events
 */

export function up(knex) {
	return knex.schema.hasColumn('club_events', 'club_slug').then(hasColumn => {
		if (!hasColumn) {
			return knex.schema.alterTable('club_events', function(table) {
				table.string('club_slug').nullable().index();
			});
		}
	});
}

export function down(knex) {
	return knex.schema.hasColumn('club_events', 'club_slug').then(hasColumn => {
		if (hasColumn) {
			return knex.schema.alterTable('club_events', function(table) {
				table.dropColumn('club_slug');
			});
		}
	});
}
