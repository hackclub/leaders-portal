import { error, fail } from '@sveltejs/kit';
import { getClubByCode } from '$lib/server/clubapi.js';
import { createMember } from '$lib/server/airtable.js';
import { getJoinPageColors } from '$lib/server/club-join-colors.js';

export async function load({ params }) {
	const { code } = params;
	const club = await getClubByCode(code);
	const clubName = club?.fields?.club_name || club?.club_name;
	
	if (!clubName) {
		throw error(404, 'Club not found');
	}

	const colors = await getJoinPageColors(clubName);
	
	return {
		code,
		clubName,
		colors
	};
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions = {
	default: async ({ request, params }) => {
		const { code } = params;
		const formData = await request.formData();
		const name = String(formData.get('name') || '').trim();
		const email = String(formData.get('email') || '').trim();

		if (!name) {
			return fail(400, { name, email, error: 'Please enter your name.' });
		}
		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { name, email, error: 'Please enter a valid email address.' });
		}

		try {
			await createMember({ name, email, joinCode: code });
			return { success: true };
		} catch (err) {
			console.error('Error creating member:', err);
			return fail(500, { name, email, error: 'Something went wrong. Please try again.' });
		}
	}
};
