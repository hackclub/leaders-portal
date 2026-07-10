import { getAirtableBase } from '$lib/server/airtable.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.userPublic?.isAdmin) {
        throw error(403, 'Forbidden');
    }
    const base = getAirtableBase();
    let allShips = [];
    let shipsByYsws = {};
    let shipsByClub = {};
    let shipsByMember = {};

    try {
        const records = await base('Club Ships')
            .select({
                fields: ['YSWS', 'Code URL', 'First Name', 'Last Name', 'club_name']
            })
            .all();

        records.forEach(record => {
            const clubNames = record.get('club_name');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const yswsNames = record.get('YSWS');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            const memberName = `${record.get('First Name') || ''} ${record.get('Last Name') || ''}`.trim() || 'Unknown';
            const codeUrl = record.get('Code URL') || null;

            allShips.push({
                ysws,
                codeUrl,
                memberName,
                clubName
            });

            shipsByYsws[ysws] = (shipsByYsws[ysws] || 0) + 1;
            shipsByClub[clubName] = (shipsByClub[clubName] || 0) + 1;
            shipsByMember[memberName] = (shipsByMember[memberName] || 0) + 1;
        });

    } catch (error) {
        console.error('Error fetching ships from Airtable:', error);
    }

    const topYsws = Object.entries(shipsByYsws)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const topClubs = Object.entries(shipsByClub)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const topMembers = Object.entries(shipsByMember)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return {
        totalShips: allShips.length,
        uniqueYsws: Object.keys(shipsByYsws).length,
        uniqueClubs: Object.keys(shipsByClub).length,
        uniqueMembers: Object.keys(shipsByMember).length,
        topYsws,
        topClubs,
        topMembers,
        allShips
    };
}
