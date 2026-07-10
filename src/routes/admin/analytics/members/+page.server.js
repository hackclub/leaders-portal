import { getAirtableBase } from '$lib/server/airtable.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }
    const base = getAirtableBase();
    let allMembers = [];
    let membersByClub = {};

    try {
        const records = await base('Members')
            .select({
                fields: ['name', 'club_name (from rel_club)', 'email']
            })
            .all();

        records.forEach(record => {
            const clubNames = record.get('club_name (from rel_club)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const name = record.get('name') || 'Unknown';
            const email = record.get('email') || null;

            allMembers.push({
                name,
                email,
                clubName
            });

            membersByClub[clubName] = (membersByClub[clubName] || 0) + 1;
        });

    } catch (error) {
        console.error('Error fetching members from Airtable:', error);
    }

    const topClubs = Object.entries(membersByClub)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const clubsWithMembers = topClubs.length;
    const avgMembersPerClub = clubsWithMembers > 0 
        ? Math.round(allMembers.length / clubsWithMembers * 10) / 10 
        : 0;

    return {
        totalMembers: allMembers.length,
        clubsWithMembers,
        avgMembersPerClub,
        topClubs,
        allMembers
    };
}
