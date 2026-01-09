import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load() {
    let allMembers = [];
    let membersByClub = {};

    try {
        const records = await base('Members')
            .select({
                fields: ['Name', 'club_name', 'Email']
            })
            .all();

        records.forEach(record => {
            const clubNames = record.get('club_name');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const name = record.get('Name') || 'Unknown';
            const email = record.get('Email') || null;

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
