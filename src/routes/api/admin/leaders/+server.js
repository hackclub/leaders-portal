import { json, error } from '@sveltejs/kit';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function POST({ request, locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }

    const { clubId } = await request.json();

    if (!clubId) {
        throw error(400, 'Club ID is required');
    }

    try {
        const records = await base('Leaders').create([
            {
                fields: {
                    'rel_leader_to_clubs': [clubId]
                }
            }
        ]);

        const newRecord = records[0];
        const updateLeaderInfoForm = newRecord.get('Update Leader Info Form');

        return json({
            success: true,
            recordId: newRecord.id,
            updateLeaderInfoForm: updateLeaderInfoForm || null
        });
    } catch (err) {
        console.error('Error creating leader in Airtable:', err);
        throw error(500, 'Failed to create leader');
    }
}
