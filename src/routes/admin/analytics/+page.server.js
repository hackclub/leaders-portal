import { getKnex } from '$lib/server/db/knex.js';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load() {
    const knex = getKnex();

    // 1. Fetch Event Completions
    const completions = await knex('user_completed_events')
        .select('event_id')
        .count('event_id as count')
        .groupBy('event_id')
        .orderBy('count', 'desc');

    // 2. Fetch Event Details from Airtable
    let eventsMap = new Map();
    try {
        const records = await base(AIRTABLE_TABLE_NAME)
            .select({
                fields: ['title', 'category']
            })
            .all();
        
        records.forEach(record => {
            eventsMap.set(record.id, {
                title: record.get('title'),
                category: record.get('category')
            });
        });
    } catch (error) {
        console.error('Error fetching events for analytics:', error);
    }

    const eventStats = completions.map(c => ({
        id: c.event_id,
        title: eventsMap.get(c.event_id)?.title || 'Unknown Event',
        category: eventsMap.get(c.event_id)?.category || 'Unknown',
        count: parseInt(c.count)
    }));

    // 3. Fetch Club Ships directly from Airtable
    let totalShips = 0;
    let allShips = [];
    let shipsByYsws = {};
    let shipsByClub = {};

    try {
        const shipRecords = await base('Club Ships')
            .select({
                fields: ['YSWS–Name (from Unified YSWS Database)', 'code_url', 'member_name', 'club_name (from Clubs)']
            })
            .all();

        shipRecords.forEach(record => {
            const clubNames = record.get('club_name (from Clubs)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const yswsNames = record.get('YSWS–Name (from Unified YSWS Database)');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            
            const ship = {
                name: ysws,
                codeUrl: record.get('code_url') || null,
                memberName: record.get('member_name') || null,
                clubName: clubName
            };

            allShips.push(ship);
            totalShips++;
            
            shipsByYsws[ysws] = (shipsByYsws[ysws] || 0) + 1;
            shipsByClub[clubName] = (shipsByClub[clubName] || 0) + 1;
        });

    } catch (error) {
        console.error('Error fetching ships from Airtable:', error);
    }

    const topYsws = Object.entries(shipsByYsws)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const topClubs = Object.entries(shipsByClub)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const sampleShips = allShips.slice(0, 20);

    return {
        eventStats,
        shipStats: {
            totalShips,
            clubCount: Object.keys(shipsByClub).length,
            topYsws,
            topClubs,
            sampleShips
        }
    };
}
