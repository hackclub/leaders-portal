import { fail } from '@sveltejs/kit';
import Airtable from 'airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from '$env/static/private';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function load() {
    let clubsData = {};
    let totalMembers = 0;
    let totalShips = 0;

    try {
        const memberRecords = await base('Members')
            .select({
                fields: ['Name', 'club_name', 'Email']
            })
            .all();
        
        totalMembers = memberRecords.length;
        
        memberRecords.forEach(record => {
            const clubNames = record.get('club_name');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : clubNames;
            
            if (clubName) {
                if (!clubsData[clubName]) {
                    clubsData[clubName] = {
                        name: clubName,
                        memberCount: 0,
                        shipCount: 0,
                        members: [],
                        ships: [],
                        yswsStats: {}
                    };
                }
                clubsData[clubName].memberCount++;
                clubsData[clubName].members.push({
                    name: record.get('Name'),
                    email: record.get('Email')
                });
            }
        });
    } catch (err) {
        console.error('Error fetching members from Airtable:', err);
    }

    try {
        const shipRecords = await base('Club Ships')
            .select({
                fields: ['YSWS–Name (from Unified YSWS Database)', 'code_url', 'member_name', 'club_name (from Clubs)']
            })
            .all();
        
        totalShips = shipRecords.length;
        
        shipRecords.forEach(record => {
            const clubNames = record.get('club_name (from Clubs)');
            const clubName = Array.isArray(clubNames) ? clubNames[0] : (clubNames || 'Unknown');
            const yswsNames = record.get('YSWS–Name (from Unified YSWS Database)');
            const ysws = Array.isArray(yswsNames) ? yswsNames[0] : (yswsNames || 'Unknown');
            
            if (clubName && clubsData[clubName]) {
                clubsData[clubName].shipCount++;
                clubsData[clubName].ships.push({
                    ysws,
                    memberName: record.get('member_name'),
                    codeUrl: record.get('code_url')
                });
                
                clubsData[clubName].yswsStats[ysws] = (clubsData[clubName].yswsStats[ysws] || 0) + 1;
            } else if (clubName) {
                clubsData[clubName] = {
                    name: clubName,
                    memberCount: 0,
                    shipCount: 1,
                    members: [],
                    ships: [{
                        ysws,
                        memberName: record.get('member_name'),
                        codeUrl: record.get('code_url')
                    }],
                    yswsStats: { [ysws]: 1 }
                };
            }
        });
    } catch (err) {
        console.error('Error fetching ships from Airtable:', err);
    }

    const clubs = Object.values(clubsData)
        .map(club => ({
            ...club,
            topYsws: Object.entries(club.yswsStats)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
        }))
        .sort((a, b) => b.memberCount - a.memberCount);

    return {
        clubs,
        stats: {
            totalClubs: clubs.length,
            totalMembers,
            totalShips
        }
    };
}

export const actions = {
    search: async ({ request }) => {
        const formData = await request.formData();
        const query = formData.get('query')?.toString().trim().toLowerCase();
        
        if (!query || query.length < 2) {
            return fail(400, { searchError: 'Search query must be at least 2 characters' });
        }
        
        let clubResults = [];
        let clubStats = {};

        try {
            const memberRecords = await base('Members')
                .select({
                    fields: ['club_name']
                })
                .all();
            
            memberRecords.forEach(record => {
                const clubNames = record.get('club_name');
                const clubName = Array.isArray(clubNames) ? clubNames[0] : clubNames;
                
                if (clubName && clubName.toLowerCase().includes(query)) {
                    if (!clubStats[clubName]) {
                        clubStats[clubName] = { name: clubName, memberCount: 0, shipCount: 0 };
                    }
                    clubStats[clubName].memberCount++;
                }
            });
            
            const shipRecords = await base('Club Ships')
                .select({
                    fields: ['club_name (from Clubs)']
                })
                .all();
            
            shipRecords.forEach(record => {
                const clubNames = record.get('club_name (from Clubs)');
                const clubName = Array.isArray(clubNames) ? clubNames[0] : clubNames;
                
                if (clubName && clubStats[clubName]) {
                    clubStats[clubName].shipCount++;
                }
            });
            
            clubResults = Object.values(clubStats)
                .sort((a, b) => b.memberCount - a.memberCount)
                .slice(0, 20);
        } catch (err) {
            console.error('Error searching clubs in Airtable:', err);
        }
        
        return { searchResults: clubResults, searchQuery: query };
    }
};
