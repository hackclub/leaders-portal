import { json, error } from '@sveltejs/kit';
import { getAirtableBase } from '$lib/server/airtable.js';

export async function GET({ locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }

    const base = getAirtableBase();
    try {
        const clubRecords = await base('Clubs')
            .select({
                fields: ['club_name'],
                sort: [{ field: 'club_name', direction: 'asc' }]
            })
            .all();

        const clubs = clubRecords.map(record => ({
            id: record.id,
            name: record.get('club_name') || 'Unnamed Club'
        }));

        return json(clubs);
    } catch (err) {
        console.error('Error fetching clubs from Airtable:', err);
        throw error(500, 'Failed to fetch clubs');
    }
}
