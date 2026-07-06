import { json, error } from '@sveltejs/kit';
import { getAirtableBase } from '$lib/server/airtable.js';

export async function POST({ request, locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }

    const { clubId } = await request.json();

    if (!clubId) {
        throw error(400, 'Club ID is required');
    }

    const base = getAirtableBase();
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
