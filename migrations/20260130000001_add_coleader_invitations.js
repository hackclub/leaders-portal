/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
	await knex.schema.createTable('coleader_invitations', (table) => {
		table.increments('id').primary();
		table.string('club_id').notNullable();
		table.string('club_name').notNullable();
		table.uuid('inviter_id').references('id').inTable('users').onDelete('CASCADE');
		table.string('inviter_email').notNullable();
		table.string('invitee_email').notNullable();
		table.text('message');
		table.enum('status', ['pending', 'accepted', 'declined', 'expired']).defaultTo('pending');
		table.timestamp('created_at').defaultTo(knex.fn.now());
		table.timestamp('expires_at');
		table.timestamp('responded_at');
		
		// Index for looking up invitations
		table.index(['invitee_email', 'status']);
		table.index(['club_id', 'status']);
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
	await knex.schema.dropTableIfExists('coleader_invitations');
}
