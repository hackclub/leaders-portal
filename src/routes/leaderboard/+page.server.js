import { getKnex } from '$lib/server/db/knex.js';

export async function load() {
	const knex = getKnex();
	
	const clubs = await knex('club_cache')
		.select('club_name', 'club_id', 'level', 'location', 'ships', 'members')
		.orderBy('club_name');

	const clubsWithStats = clubs.map(club => {
		const ships = typeof club.ships === 'string' ? JSON.parse(club.ships) : (club.ships || []);
		const members = typeof club.members === 'string' ? JSON.parse(club.members) : (club.members || []);
		
		return {
			name: club.club_name,
			id: club.club_id,
			level: club.level,
			location: club.location,
			shipsCount: Array.isArray(ships) ? ships.length : 0,
			membersCount: Array.isArray(members) ? members.length : 0,
			ships: ships
		};
	});

	clubsWithStats.sort((a, b) => b.shipsCount - a.shipsCount);

	const rankedClubs = clubsWithStats.map((club, index) => ({
		...club,
		rank: index + 1
	}));

	return {
		clubs: rankedClubs,
		totalClubs: rankedClubs.length,
		totalShips: rankedClubs.reduce((sum, club) => sum + club.shipsCount, 0)
	};
}
