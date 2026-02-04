/**
 * Migration to add club_members table for authenticated member tracking
 * This replaces the Fillout form-based member registration with Hack Club auth
 */
export async function up(knex) {
// Create club_members table to track authenticated members
await knex.schema.createTable('club_members', (t) => {
t.uuid('id').primary();
t.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable();
t.text('club_slug').notNullable(); // The club code/slug from the join link
t.text('club_name').notNullable(); // The actual club name
t.text('status').notNullable().defaultTo('active'); // active, removed, left
t.timestamp('joined_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
t.timestamp('removed_at', { useTz: true });
t.text('removed_by'); // user_id of leader who removed them, or 'self' if they left
t.text('removal_reason');
t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();

// A user can only be an active member of a club once
t.unique(['user_id', 'club_slug']);
t.index(['club_slug']);
t.index(['club_name']);
t.index(['user_id']);
t.index(['status']);
});
}

export async function down(knex) {
await knex.schema.dropTableIfExists('club_members');
}
