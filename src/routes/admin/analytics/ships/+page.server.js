import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load() {
    let allShips = [];
    let shipsByYsws = {};
    let shipsByClub = {};
    let shipsByMember = {};

    try {
        const records = await base('Club Ships')
            .select({
                fields: ['YSWS–Name (from Unified YSWS Database)', 'code_url', 'member_name', 'club_name (from Clubs)']
            })
            .all();

        records.forEach(record => {
            const clubNames = record.get('club_name (from Clubs)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const yswsNames = record.get('YSWS–Name (from Unified YSWS Database)');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            const memberName = record.get('member_name') || 'Unknown';
            const codeUrl = record.get('code_url') || null;

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
