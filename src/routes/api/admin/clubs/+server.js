import { json, error } from '@sveltejs/kit';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function GET({ locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }

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
