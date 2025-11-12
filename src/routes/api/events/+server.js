import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function GET({ locals }) {
	try {
		const events = [];

		const records = await base(AIRTABLE_TABLE_NAME)
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
				completed: isCompleted
			});
		});

		return json(events);
	} catch (error) {
		console.error('Error fetching events from Airtable:', error);
		return json({ error: 'Failed to fetch events' }, { status: 500 });
	}
}
