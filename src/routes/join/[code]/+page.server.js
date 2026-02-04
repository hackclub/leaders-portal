import { error, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getKnex } from '$lib/server/db/knex.js';
import { getClubByCode } from '$lib/server/clubapi.js';
import { sendWelcomeEmail } from '$lib/server/email.js';

export async function load({ params, locals }) {
	const { code } = params;
	const club = await getClubByCode(code);
	
	if (!club) {
		throw error(404, 'Club not found');
	}
	
	const clubName = club?.fields?.club_name || club?.club_name;
	const clubLocation = club?.fields?.venue_address_country || club?.location || null;
	
	if (!clubName) {
		throw error(404, 'Club not found');
	}
	
	// Check if user is already logged in
	const isLoggedIn = !!locals.userId;
	let alreadyMember = false;
	let memberStatus = null;
	let user = null;
	
	if (isLoggedIn) {
		const knex = getKnex();
		user = await knex('users').where({ id: locals.userId }).first();
		
		// Check if already a member
		const existingMembership = await knex('club_members')
			.where({ 
				user_id: locals.userId, 
				club_slug: code 
			})
			.first();
		
		if (existingMembership) {
			alreadyMember = true;
			memberStatus = existingMembership.status;
		}
	}
	
	return {
		code,
		clubName,
		clubLocation,
		isLoggedIn,
		alreadyMember,
		memberStatus,
		user: user ? {
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email
		} : null
	};
}

export const actions = {
	join: async ({ params, locals }) => {
		if (!locals.userId) {
			throw redirect(302, `/join/${params.code}?needsLogin=true`);
		}
		
		const { code } = params;
		const club = await getClubByCode(code);
		
		if (!club) {
			return { error: 'Club not found' };
		}
		
		const clubName = club?.fields?.club_name || club?.club_name;
		
		if (!clubName) {
			return { error: 'Club not found' };
		}
		
		const knex = getKnex();
		
		// Check if already a member
		const existingMembership = await knex('club_members')
			.where({ 
				user_id: locals.userId, 
				club_slug: code 
			})
			.first();
		
		if (existingMembership) {
			if (existingMembership.status === 'active') {
				return { error: 'You are already a member of this club' };
			}
			
			// Reactivate membership if they left or were removed
			await knex('club_members')
				.where({ id: existingMembership.id })
				.update({
					status: 'active',
					removed_at: null,
					removed_by: null,
					removal_reason: null,
					updated_at: new Date()
				});

			// Get user info for welcome email
			const user = await knex('users').where({ id: locals.userId }).first();
			if (user?.email) {
				const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email?.split('@')[0];
				try {
					await sendWelcomeEmail({
						recipientEmail: user.email,
						recipientName: userName,
						clubName: clubName,
						joinCode: code
					});
				} catch (err) {
					console.error('Failed to send welcome email:', err.message);
				}
			}
			
			return { success: true, rejoined: true };
		}
		
		// Create new membership
		await knex('club_members').insert({
			id: crypto.randomUUID(),
			user_id: locals.userId,
			club_slug: code,
			club_name: clubName,
			status: 'active',
			joined_at: new Date()
		});

		// Get user info for welcome email
		const user = await knex('users').where({ id: locals.userId }).first();
		if (user?.email) {
			const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email?.split('@')[0];
			try {
				await sendWelcomeEmail({
					recipientEmail: user.email,
					recipientName: userName,
					clubName: clubName,
					joinCode: code
				});
			} catch (err) {
				console.error('Failed to send welcome email:', err.message);
			}
		}
		
		return { success: true };
	}
};
