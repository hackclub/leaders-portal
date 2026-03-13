import { getKnex } from './db/knex.js';
import {
	getClubByName,
	getClubLevel,
	getClubShips,
	getClubMembers,
	getClubsForLeaderEmail
} from './clubapi.js';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function isCacheStale(cachedAt) {
	if (!cachedAt) return true;
	const cacheTime = new Date(cachedAt).getTime();
	const now = Date.now();
	return now - cacheTime > CACHE_TTL_MS;
}

export async function getCachedClub(clubName) {
	const knex = getKnex();
	const cached = await knex('club_cache').where({ club_name: clubName }).first();
	return cached;
}

export async function getCachedLeaderClubs(email) {
	const knex = getKnex();
	const cached = await knex('leader_clubs_cache').where({ email }).first();
	return cached;
}

export async function cacheClubData(clubName, data) {
	const knex = getKnex();
	const now = new Date();

	await knex('club_cache')
		.insert({
			club_name: clubName,
			club_id: data.clubId || null,
			level: data.level || null,
			location: data.location || null,
			join_code: data.joinCode || null,
			ships: JSON.stringify(data.ships || []),
			members: JSON.stringify(data.members || []),
			cached_at: now
		})
		.onConflict('club_name')
		.merge();

	console.log('[ClubCache] Cached data for club:', clubName);
	return data;
}

export async function cacheLeaderClubs(email, clubNames) {
	const knex = getKnex();
	const now = new Date();

	await knex('leader_clubs_cache')
		.insert({
			email,
			club_names: JSON.stringify(clubNames),
			cached_at: now
		})
		.onConflict('email')
		.merge();

	console.log('[ClubCache] Cached leader clubs for:', email, 'clubs:', clubNames);
}

export async function refreshClubFromApi(clubName) {
	console.log('[ClubCache] Refreshing club from API:', clubName);

	const [clubInfo, level, members] = await Promise.all([
		getClubByName(clubName),
		getClubLevel(clubName),
		getClubMembers(clubName)
	]);

	const clubId = clubInfo?.id || clubInfo?.fields?.id || null;
	const ships = clubId ? await getClubShips(clubId) : [];

	const data = {
		clubId: clubInfo?.id || clubInfo?.fields?.id || null,
		level: level || clubInfo?.fields?.level || clubInfo?.level || null,
		location: clubInfo?.fields?.venue_address_country || clubInfo?.venue_address_country || null,
		joinCode: clubInfo?.fields?.['Join Code'] || clubInfo?.['Join Code'] || null,
		ships: ships || [],
		members: members || []
	};

	await cacheClubData(clubName, data);
	return data;
}

export async function refreshLeaderClubsFromApi(email) {
	console.log('[ClubCache] Refreshing leader clubs from API:', email);

	const apiClubs = await getClubsForLeaderEmail(email);
	const clubNames = apiClubs.map(c => c.name);

	await cacheLeaderClubs(email, clubNames);

	for (const club of apiClubs) {
		const [ships, members] = await Promise.all([
			club.id ? getClubShips(club.id) : Promise.resolve([]),
			getClubMembers(club.name)
		]);

		await cacheClubData(club.name, {
			clubId: club.id,
			level: club.level,
			location: club.location,
			joinCode: club.joinCode,
			ships,
			members
		});
	}

	return clubNames;
}

export async function getClubWithCache(clubName) {
	const cached = await getCachedClub(clubName);

	if (cached && !isCacheStale(cached.cached_at)) {
		console.log('[ClubCache] Cache hit for club:', clubName);
		return {
			name: clubName,
			id: cached.club_id,
			level: cached.level,
			location: cached.location,
			joinCode: cached.join_code,
			ships: typeof cached.ships === 'string' ? JSON.parse(cached.ships) : cached.ships,
			members: typeof cached.members === 'string' ? JSON.parse(cached.members) : cached.members,
			cachedAt: cached.cached_at
		};
	}

	console.log('[ClubCache] Cache miss or stale for club:', clubName);
	const freshData = await refreshClubFromApi(clubName);

	return {
		name: clubName,
		id: freshData.clubId,
		level: freshData.level,
		location: freshData.location,
		joinCode: freshData.joinCode,
		ships: freshData.ships,
		members: freshData.members,
		cachedAt: new Date()
	};
}

export async function getLeaderClubsWithCache(email) {
	const cached = await getCachedLeaderClubs(email);

	if (cached && !isCacheStale(cached.cached_at)) {
		console.log('[ClubCache] Cache hit for leader clubs:', email);
		const clubNames = typeof cached.club_names === 'string'
			? JSON.parse(cached.club_names)
			: cached.club_names;

		const clubs = await Promise.all(
			clubNames.map(async (clubName) => {
				const clubData = await getClubWithCache(clubName);
				return {
					...clubData,
					role: 'leader'
				};
			})
		);

		return clubs;
	}

	console.log('[ClubCache] Cache miss or stale for leader clubs:', email);
	await refreshLeaderClubsFromApi(email);

	const freshCached = await getCachedLeaderClubs(email);
	if (!freshCached) {
		return [];
	}

	const clubNames = typeof freshCached.club_names === 'string'
		? JSON.parse(freshCached.club_names)
		: freshCached.club_names;

	const clubs = await Promise.all(
		clubNames.map(async (clubName) => {
			const clubData = await getClubWithCache(clubName);
			return {
				...clubData,
				role: 'leader'
			};
		})
	);

	return clubs;
}

export async function invalidateClubCache(clubName) {
	const knex = getKnex();
	await knex('club_cache').where({ club_name: clubName }).del();
	console.log('[ClubCache] Invalidated cache for club:', clubName);
}

export async function invalidateLeaderCache(email) {
	const knex = getKnex();
	await knex('leader_clubs_cache').where({ email }).del();
	console.log('[ClubCache] Invalidated cache for leader:', email);
}

export async function refreshAllStaleClubs() {
	const knex = getKnex();
	const staleThreshold = new Date(Date.now() - CACHE_TTL_MS);

	const staleClubs = await knex('club_cache')
		.where('cached_at', '<', staleThreshold)
		.select('club_name');

	console.log('[ClubCache] Found', staleClubs.length, 'stale clubs to refresh');

	for (const club of staleClubs) {
		try {
			await refreshClubFromApi(club.club_name);
		} catch (error) {
			console.error('[ClubCache] Error refreshing club:', club.club_name, error.message);
		}
	}

	return staleClubs.length;
}

export async function getLastCacheTime(clubName) {
	const cached = await getCachedClub(clubName);
	return cached?.cached_at || null;
}
