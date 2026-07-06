import { getAirtableBase } from '$lib/server/airtable.js';
import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';

// Homepage events live in a dedicated Airtable base, in the "Club Events" table.
const EVENTS_BASE_ID = 'appmmb6l3gwtDXwhT';
const EVENTS_TABLE = 'Club Events';

export async function GET({ locals }) {
	try {
		const base = getAirtableBase(EVENTS_BASE_ID);
		const events = [];

		const records = await base(EVENTS_TABLE)
			.select({
				view: 'Grid view'
			})
			.all();

		let completedEventIds = [];
		if (locals.userId) {
			const knex = getKnex();
			const completedRecords = await knex('user_completed_events')
				.where({ user_id: locals.userId })
				.select('event_id');
			completedEventIds = completedRecords.map(r => r.event_id);
		}

		records.forEach((record) => {
			const eventId = record.id;
			const isCompleted = completedEventIds.includes(eventId);
			const originalCategory = record.get('category');
			
			events.push({
				id: eventId,
				title: record.get('title'),
				type: record.get('type'),
				category: isCompleted ? 'Completed' : originalCategory,
				originalCategory: originalCategory,
				et: record.get('et'),
				difficulty: record.get('difficulty'),
				description: record.get('description'),
				link: record.get('link'),
				color: record.get('color'),
				textColor: record.get('textColor'),
				buttonColor: record.get('buttonColor'),
				buttonTextColor: record.get('buttonTextColor'),
				icon: record.get('icon'),
				guide: record.get('guide'),
				noGuide: record.get('no-guide'),
				backgroundUrl: record.get('background-url'),
				completed: isCompleted
			});
		});

		return json(events);
	} catch (error) {
		console.error('Error fetching events from Airtable:', error);
		return json({ error: 'Failed to fetch events' }, { status: 500 });
	}
}
