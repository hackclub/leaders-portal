import { error } from '@sveltejs/kit';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load({ params }) {
    const clubName = decodeURIComponent(params.id);
    
    let club = {
        name: clubName,
        members: [],
        ships: [],
        yswsStats: {}
    };

    try {
        const memberRecords = await base('Members')
            .select({
                filterByFormula: `FIND("${clubName.replace(/"/g, '\\"')}", {club_name})`,
                fields: ['Name', 'Email', 'club_name']
            })
            .all();
        
        club.members = memberRecords.map(record => ({
            name: record.get('Name') || 'Unknown',
            email: record.get('Email') || 'N/A'
        }));
    } catch (err) {
        console.error('Error fetching members:', err);
    }

    try {
        const shipRecords = await base('Club Ships')
            .select({
                filterByFormula: `FIND("${clubName.replace(/"/g, '\\"')}", {club_name (from Clubs)})`,
                fields: ['YSWS–Name (from Unified YSWS Database)', 'code_url', 'member_name', 'club_name (from Clubs)']
            })
            .all();
        
        shipRecords.forEach(record => {
            const yswsNames = record.get('YSWS–Name (from Unified YSWS Database)');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            
            club.ships.push({
                name: ysws,
                memberName: record.get('member_name') || 'Unknown',
                codeUrl: record.get('code_url')
            });
            
            club.yswsStats[ysws] = (club.yswsStats[ysws] || 0) + 1;
        });
    } catch (err) {
        console.error('Error fetching ships:', err);
    }

    if (club.members.length === 0 && club.ships.length === 0) {
        throw error(404, `Club "${clubName}" not found`);
    }

    club.topYsws = Object.entries(club.yswsStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return { club };
}
