import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';

export async function POST({ locals }) {
	if (!locals.userPublic?.isAdmin) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	try {
		const knex = getKnex();
		
		const clubCacheCount = await knex('club_cache').del();
		const leaderCacheCount = await knex('leader_clubs_cache').del();

		console.log('[Admin] Cache cleared:', { clubCacheCount, leaderCacheCount });

		return json({
			success: true,
			cleared: {
				clubs: clubCacheCount,
				leaders: leaderCacheCount
			}
		});
	} catch (error) {
		console.error('[Admin] Error clearing cache:', error);
		return json({ error: 'Failed to clear cache' }, { status: 500 });
	}
}
