/**
 * Migration to add club_slug column to club_announcements table
 * This allows members who joined via join code to see announcements
 */

export function up(knex) {
	return knex.schema.hasColumn('club_announcements', 'club_slug').then(hasColumn => {
		if (!hasColumn) {
			return knex.schema.alterTable('club_announcements', function(table) {
				table.string('club_slug').nullable().index();
			});
		}
	});
}

export function down(knex) {
	return knex.schema.hasColumn('club_announcements', 'club_slug').then(hasColumn => {
		if (hasColumn) {
			return knex.schema.alterTable('club_announcements', function(table) {
				table.dropColumn('club_slug');
			});
		}
	});
}
