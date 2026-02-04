import { redirect, fail } from '@sveltejs/kit';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubsForEmail, getEffectiveEmailForUser } from '$lib/server/sync-clubs.js';
import { deleteMember, getMember, updateMember, createMember, addLeaderToClub } from '$lib/server/clubapi.js';
import { sendMemberInvitation, sendPromotionEmail } from '$lib/server/email.js';
import { refreshClubFromApi } from '$lib/server/club-cache.js';
import { checkEmailSendRateLimit, recordEmailSent } from '$lib/server/rate-limit.js';

export async function load({ locals, params }) {
	if (!locals.userPublic) {
		throw redirect(302, '/auth/login');
	}

	const knex = getKnex();
	const user = await knex('users').where({ id: locals.userId }).first();
	const effectiveEmail = getEffectiveEmailForUser(user);
	const clubs = await getClubsForEmail(effectiveEmail);

	const clubName = decodeURIComponent(params.club);
	const club = clubs.find(c => c.name === clubName);

	if (!club) {
		throw redirect(302, '/my-club');
	}

	// Get authenticated members from our database
	const authenticatedMembers = await knex('club_members')
		.join('users', 'club_members.user_id', 'users.id')
		.where({ 
			'club_members.club_name': clubName,
			'club_members.status': 'active'
		})
		.select(
			'club_members.id as membership_id',
			'club_members.user_id',
			'club_members.joined_at',
			'users.first_name',
			'users.last_name',
			'users.email',
			'users.username'
		)
		.orderBy('club_members.joined_at', 'desc');

	return {
		user: locals.userPublic,
		club,
		authenticatedMembers: authenticatedMembers.map(m => ({
			id: m.membership_id,
			userId: m.user_id,
			name: [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username || m.email?.split('@')[0] || 'Unknown',
			email: m.email,
			joinedAt: m.joined_at
		}))
	};
}

export const actions = {
	removeMember: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const clubName = decodeURIComponent(params.club);

		if (!memberName) {
			return fail(400, { error: 'Missing member name' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can remove members' });
		}

		// Check if member exists - club.members could be array of strings or array of objects
		let isMemberOfClub = false;
		if (Array.isArray(club.members)) {
			isMemberOfClub = club.members.some(m => {
				if (typeof m === 'string') return m === memberName;
				if (typeof m === 'object') return m.name === memberName || m.Name === memberName;
				return false;
			});
		}
		
		if (!isMemberOfClub) {
			return fail(400, { error: 'Member not found in this club' });
		}

		try {
			await deleteMember(memberName, clubName);
			// Refresh the club cache to reflect the removal
			await refreshClubFromApi(clubName);
			return { success: true, removeSuccess: true };
		} catch (error) {
			console.error('[Members] Error removing member:', error);
			return fail(500, { error: 'Failed to remove member' });
		}
	},

	removeAuthenticatedMember: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const membershipId = formData.get('membershipId');
		const clubName = decodeURIComponent(params.club);

		if (!membershipId) {
			return fail(400, { error: 'Missing membership ID' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can remove members' });
		}

		// Update membership status to removed
		const updated = await knex('club_members')
			.where({ 
				id: membershipId,
				club_name: clubName
			})
			.update({
				status: 'removed',
				removed_at: new Date(),
				removed_by: locals.userId,
				updated_at: new Date()
			});

		if (!updated) {
			return fail(404, { error: 'Membership not found' });
		}

		return { success: true, removedAuth: true };
	},

	getMemberInfo: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const clubName = decodeURIComponent(params.club);

		if (!memberName) {
			return fail(400, { error: 'Missing member name' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can view member details' });
		}

		try {
			const member = await getMember(memberName);
			return { success: true, member };
		} catch (error) {
			console.error('[Members] Error getting member info:', error);
			return fail(500, { error: 'Failed to get member info' });
		}
	},

	editMember: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const memberName = formData.get('memberName');
		const newName = formData.get('newName');
		const newEmail = formData.get('newEmail');
		const clubName = decodeURIComponent(params.club);

		if (!memberName) {
			return fail(400, { error: 'Missing member name' });
		}

		if (!newName && !newEmail) {
			return fail(400, { error: 'No updates provided' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can edit members' });
		}

		try {
			const result = await updateMember(memberName, newName || null, newEmail || null);
			return { success: true, editSuccess: true, member: result };
		} catch (error) {
			console.error('[Members] Error editing member:', error);
			return fail(500, { error: 'Failed to edit member' });
		}
	},

	addMember: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const clubName = decodeURIComponent(params.club);

		if (!name || !email) {
			return fail(400, { error: 'Name and email are required' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can add members' });
		}

		if (!club.joinCode) {
			return fail(400, { error: 'Club does not have a join code' });
		}

		// Check email rate limits
		const rateCheck = await checkEmailSendRateLimit(effectiveEmail, email);
		if (!rateCheck.allowed) {
			return fail(429, { error: rateCheck.message });
		}

		try {
			// Add to Airtable via clubapi
			const result = await createMember(name, email, club.joinCode);
			
			// Refresh the club cache to show the new member
			await refreshClubFromApi(clubName);
			
			// Send invitation email (fire-and-forget, don't block response)
			const inviterName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || effectiveEmail?.split('@')[0] || 'Your club leader';
			
			// Record email sent for rate limiting
			recordEmailSent(effectiveEmail, email).catch(err => console.error('[Members] Rate limit record failed:', err));
			
			sendMemberInvitation({
				recipientEmail: email,
				recipientName: name,
				clubName: clubName,
				inviterName: inviterName,
				joinCode: club.joinCode
			}).catch(err => console.error('[Members] Email send failed:', err));
			
			return { success: true, addSuccess: true, member: result };
		} catch (error) {
			console.error('[Members] Error adding member:', error);
			return fail(500, { error: 'Failed to add member' });
		}
	},

	promoteToCoLeader: async ({ request, locals, params }) => {
		if (!locals.userPublic) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const membershipId = formData.get('membershipId');
		const clubName = decodeURIComponent(params.club);

		if (!membershipId) {
			return fail(400, { error: 'Missing membership ID' });
		}

		const knex = getKnex();
		const user = await knex('users').where({ id: locals.userId }).first();
		const effectiveEmail = getEffectiveEmailForUser(user);
		const clubs = await getClubsForEmail(effectiveEmail);

		const club = clubs.find(c => c.name === clubName);
		if (!club) {
			return fail(403, { error: 'You do not have access to this club' });
		}

		if (club.role !== 'leader') {
			return fail(403, { error: 'Only club leaders can promote members' });
		}

		// Get the member being promoted
		const membership = await knex('club_members')
			.join('users', 'club_members.user_id', 'users.id')
			.where({ 
				'club_members.id': membershipId,
				'club_members.club_name': clubName,
				'club_members.status': 'active'
			})
			.select(
				'club_members.id',
				'club_members.user_id',
				'users.email',
				'users.first_name',
				'users.last_name',
				'users.username'
			)
			.first();

		if (!membership) {
			return fail(404, { error: 'Member not found' });
		}

		if (!membership.email) {
			return fail(400, { error: 'Member does not have an email address' });
		}

		// Check email rate limits for promotion email
		const rateCheck = await checkEmailSendRateLimit(effectiveEmail, membership.email);
		if (!rateCheck.allowed) {
			return fail(429, { error: rateCheck.message });
		}

		try {
			// Add to Airtable as a leader via clubapi
			await addLeaderToClub(membership.email, club.id);
			
			// Remove from club_members table since they're now a leader
			await knex('club_members')
				.where({ id: membershipId })
				.update({
					status: 'promoted',
					updated_at: new Date()
				});

			// Record email sent for rate limiting
			recordEmailSent(effectiveEmail, membership.email).catch(err => console.error('[Members] Rate limit record failed:', err));

			// Send promotion email (fire-and-forget, don't block response)
			const promoterName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || effectiveEmail?.split('@')[0] || 'Your club leader';
			const memberName = [membership.first_name, membership.last_name].filter(Boolean).join(' ') || membership.username || membership.email?.split('@')[0];

			sendPromotionEmail({
				recipientEmail: membership.email,
				recipientName: memberName,
				clubName: clubName,
				promoterName: promoterName
			}).catch(err => console.error('[Members] Promotion email failed:', err));

			return { success: true, promoteSuccess: true, promotedEmail: membership.email };
		} catch (error) {
			console.error('[Members] Error promoting member:', error);
			return fail(500, { error: error.message || 'Failed to promote member' });
		}
	}
};
