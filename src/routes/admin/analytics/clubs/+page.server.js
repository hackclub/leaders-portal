import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load() {
    let clubData = {};

    try {
        const memberRecords = await base('Members')
            .select({
                fields: ['Name', 'club_name']
            })
            .all();

        memberRecords.forEach(record => {
            const clubNames = record.get('club_name');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            
            if (!clubData[clubName]) {
                clubData[clubName] = { members: 0, ships: 0 };
            }
            clubData[clubName].members++;
        });

    } catch (error) {
        console.error('Error fetching members from Airtable:', error);
    }

    try {
        const shipRecords = await base('Club Ships')
            .select({
                fields: ['club_name (from Clubs)', 'YSWS–Name (from Unified YSWS Database)']
            })
            .all();

        shipRecords.forEach(record => {
            const clubNames = record.get('club_name (from Clubs)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            
            if (!clubData[clubName]) {
                clubData[clubName] = { members: 0, ships: 0 };
            }
            clubData[clubName].ships++;
        });

    } catch (error) {
        console.error('Error fetching ships from Airtable:', error);
    }

    const allClubs = Object.entries(clubData)
        .map(([name, data]) => ({
            name,
            members: data.members,
            ships: data.ships,
            shipsPerMember: data.members > 0 ? Math.round(data.ships / data.members * 100) / 100 : 0
        }))
        .sort((a, b) => b.members - a.members);

    const totalClubs = allClubs.length;
    const totalMembers = allClubs.reduce((sum, c) => sum + c.members, 0);
    const totalShips = allClubs.reduce((sum, c) => sum + c.ships, 0);
    const avgMembersPerClub = totalClubs > 0 ? Math.round(totalMembers / totalClubs * 10) / 10 : 0;
    const avgShipsPerClub = totalClubs > 0 ? Math.round(totalShips / totalClubs * 10) / 10 : 0;
    
    const clubsWithShips = allClubs.filter(c => c.ships > 0).length;
    const clubsWithoutShips = totalClubs - clubsWithShips;

    const topByMembers = [...allClubs].sort((a, b) => b.members - a.members).slice(0, 10);
    const topByShips = [...allClubs].sort((a, b) => b.ships - a.ships).slice(0, 10);
    const topByRatio = [...allClubs]
        .filter(c => c.members >= 3)
        .sort((a, b) => b.shipsPerMember - a.shipsPerMember)
        .slice(0, 10);

    return {
        totalClubs,
        totalMembers,
        totalShips,
        avgMembersPerClub,
        avgShipsPerClub,
        clubsWithShips,
        clubsWithoutShips,
        topByMembers,
        topByShips,
        topByRatio,
        allClubs
    };
}
