import crypto from 'node:crypto';

export async function syncUserClubs(knex, userId, clubsData) {
	const clubs = clubsData.clubs || [];

	for (const clubData of clubs) {
		let club = await knex('clubs')
			.where({ provider_club_id: clubData.id })
			.first();

		if (!club) {
			const [newClub] = await knex('clubs')
				.insert({
					id: crypto.randomUUID(),
					provider_club_id: clubData.id,
					name: clubData.name,
					description: clubData.description || null,
					location: clubData.location || null,
					member_count: clubData.member_count || null,
					balance: clubData.balance || null,
					created_at: new Date(),
					updated_at: new Date()
				})
				.returning('*');
			club = newClub;
		} else {
			await knex('clubs')
				.where({ id: club.id })
				.update({
					name: clubData.name,
					description: clubData.description || null,
					location: clubData.location || null,
					member_count: clubData.member_count || null,
					balance: clubData.balance || null,
					updated_at: new Date()
				});
		}

		const existingUserClub = await knex('user_clubs')
			.where({ user_id: userId, club_id: club.id })
			.first();

		if (!existingUserClub) {
			await knex('user_clubs').insert({
				id: crypto.randomUUID(),
				user_id: userId,
				club_id: club.id,
				role: clubData.role || 'member',
				joined_at: clubData.joined_at ? new Date(clubData.joined_at) : null,
				created_at: new Date()
			});
		} else {
			await knex('user_clubs')
				.where({ id: existingUserClub.id })
				.update({
					role: clubData.role || 'member',
					joined_at: clubData.joined_at ? new Date(clubData.joined_at) : null
				});
		}
	}

	const clubIds = clubs.map((c) => c.id);
	if (clubIds.length > 0) {
		const existingClubUuids = await knex('clubs')
			.whereIn('provider_club_id', clubIds)
			.pluck('id');

		await knex('user_clubs')
			.where({ user_id: userId })
			.whereNotIn('club_id', existingClubUuids)
			.del();
	}
}

export async function getUserClubs(knex, userId) {
	return knex('user_clubs')
		.join('clubs', 'user_clubs.club_id', 'clubs.id')
		.where('user_clubs.user_id', userId)
		.select(
			'clubs.id',
			'clubs.provider_club_id',
			'clubs.name',
			'clubs.description',
			'clubs.location',
			'clubs.member_count',
			'clubs.balance',
			'user_clubs.role',
			'user_clubs.joined_at'
		);
}
