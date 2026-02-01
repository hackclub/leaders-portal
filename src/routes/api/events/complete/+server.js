import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';

function isValidAirtableId(id) {
	if (!id || typeof id !== 'string') return false;
	return /^rec[a-zA-Z0-9]{14}$/.test(id);
}

export async function POST({ request, locals }) {
	try {
		if (!locals.userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { eventId } = await request.json();

		if (!eventId) {
			return json({ error: 'Event ID is required' }, { status: 400 });
		}

		if (!isValidAirtableId(eventId)) {
			return json({ error: 'Invalid event ID format' }, { status: 400 });
		}

		const knex = getKnex();
		await knex('user_completed_events')
			.insert({
				user_id: locals.userId,
				event_id: eventId
			})
			.onConflict(['user_id', 'event_id'])
			.ignore();

		return json({ success: true });
	} catch (error) {
		console.error('Error marking event as complete:', error);
		return json({ error: 'Failed to mark event as complete' }, { status: 500 });
	}
}

export async function DELETE({ request, locals }) {
	try {
		if (!locals.userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { eventId } = await request.json();

		if (!eventId) {
			return json({ error: 'Event ID is required' }, { status: 400 });
		}

		if (!isValidAirtableId(eventId)) {
			return json({ error: 'Invalid event ID format' }, { status: 400 });
		}

		const knex = getKnex();
		await knex('user_completed_events')
			.where({ user_id: locals.userId, event_id: eventId })
			.del();

		return json({ success: true });
	} catch (error) {
		console.error('Error unmarking event:', error);
		return json({ error: 'Failed to unmark event' }, { status: 500 });
	}
}
