import { getKnex } from './db/knex.js';

/**
 * Generate a club slug from a club name.
 * @param {string} name
 */
function clubSlug(name) {
	return (name || '').toLowerCase().replace(/\s+/g, '-');
}

/**
 * Normalize an event row so dates/times are plain strings the client can use.
 * event_date -> 'YYYY-MM-DD', event_time -> 'HH:MM'
 * @param {object} event
 */
function normalizeEvent(event) {
	if (!event) return event;
	let date = event.event_date;
	if (date instanceof Date) {
		date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	} else if (typeof date === 'string') {
		date = date.slice(0, 10);
	}
	let time = event.event_time;
	if (typeof time === 'string') {
		time = time.slice(0, 5);
	}
	return { ...event, event_date: date, event_time: time };
}

/**
 * Store a scheduled event for a club so members can view it later.
 * @param {object} event
 * @param {string} event.clubName
 * @param {string} event.title
 * @param {string} event.description
 * @param {string} event.eventDate - ISO date string (YYYY-MM-DD)
 * @param {string} [event.eventTime] - time string (HH:MM)
 * @param {string} event.location
 * @param {string} event.createdBy
 */
export async function saveEvent({ clubName, title, description, eventDate, eventTime, location, createdBy }) {
	const knex = getKnex();
	await knex('club_events').insert({
		club_name: clubName,
		title,
		description,
		event_date: eventDate,
		event_time: eventTime || null,
		location,
		created_by: createdBy,
		club_slug: clubSlug(clubName)
	});
	console.log('[Events] Stored event for club:', clubName);
}

/**
 * Update an existing event.
 * @param {number} id
 * @param {object} fields
 * @param {string} fields.title
 * @param {string} fields.description
 * @param {string} fields.eventDate
 * @param {string} [fields.eventTime]
 * @param {string} fields.location
 */
export async function updateEvent(id, { title, description, eventDate, eventTime, location }) {
	const knex = getKnex();
	await knex('club_events')
		.where({ id })
		.update({
			title,
			description,
			event_date: eventDate,
			event_time: eventTime || null,
			location,
			updated_at: knex.fn.now()
		});
	console.log('[Events] Updated event:', id);
}

/**
 * Delete an event.
 * @param {number} id
 */
export async function deleteEvent(id) {
	const knex = getKnex();
	await knex('club_events').where({ id }).del();
	console.log('[Events] Deleted event:', id);
}

/**
 * Get a single event by id.
 * @param {number} id
 */
export async function getEventById(id) {
	const knex = getKnex();
	const event = await knex('club_events').where({ id }).first();
	return normalizeEvent(event);
}

/**
 * Get all events for a club (used to render the calendar).
 * @param {string} clubName
 */
export async function getEventsForClub(clubName) {
	if (!clubName) return [];
	const knex = getKnex();
	const events = await knex('club_events')
		.where({ club_name: clubName })
		.orderBy('event_date', 'asc')
		.orderBy('event_time', 'asc');
	return events.map(normalizeEvent);
}

/**
 * Get upcoming events for a club, soonest first.
 * @param {string} clubName
 * @param {number} limit
 */
export async function getUpcomingEventsForClub(clubName, limit = 50) {
	if (!clubName) return [];
	const knex = getKnex();
	const today = new Date().toISOString().slice(0, 10);
	const events = await knex('club_events')
		.where({ club_name: clubName })
		.andWhere('event_date', '>=', today)
		.orderBy('event_date', 'asc')
		.orderBy('event_time', 'asc')
		.limit(limit);
	return events.map(normalizeEvent);
}
