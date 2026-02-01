import { json } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { getLeaderClubsWithCache } from '$lib/server/club-cache.js';
import { sendCoLeaderInvitation } from '$lib/server/email.js';

export async function POST({ request, locals }) {
	if (!locals.userPublic) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { clubId, email, message } = body;

	if (!email) {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ error: 'Invalid email address' }, { status: 400 });
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);

	const clubs = await getLeaderClubsWithCache(effectiveEmail);
	
	let club;
	if (clubId) {
		club = clubs.find(c => c.id === clubId);
	} else if (clubs.length === 1) {
		club = clubs[0];
	}

	if (!club) {
		return json({ error: 'Club not found or no access' }, { status: 403 });
	}

	try {
		const [invitation] = await knex('coleader_invitations')
			.insert({
				club_id: club.id,
				club_name: club.name,
				inviter_id: locals.userId,
				inviter_email: effectiveEmail,
				invitee_email: email.toLowerCase().trim(),
				message: message || null,
				status: 'pending',
				created_at: new Date(),
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
			})
			.returning('*');

		await sendCoLeaderInvitation({
			inviteeEmail: email,
			clubName: club.name,
			inviterName: user.name || effectiveEmail,
			message: message,
			invitationId: invitation.id
		});

		return json({
			success: true,
			message: `Invitation sent to ${email}`
		});
	} catch (error) {
		console.error('[API] Error sending co-leader invitation:', error);
		
		if (error.code === '23505') {
			return json({ error: 'An invitation has already been sent to this email' }, { status: 400 });
		}
		
		return json({ error: 'Failed to send invitation. Please try again.' }, { status: 500 });
	}
}
