import { fail } from '@sveltejs/kit';
import { createMember } from '$lib/server/airtable.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JOIN_CODE_REGEX = /^[A-Z1-9]{2,6}$/;

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') || '').trim();
		const email = String(formData.get('email') || '').trim();
		const joinCode = String(formData.get('joinCode') || '').trim().toUpperCase();

		if (!name) {
			return fail(400, { name, email, joinCode, error: 'Please enter your name.' });
		}
		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { name, email, joinCode, error: 'Please enter a valid email address.' });
		}
		if (!JOIN_CODE_REGEX.test(joinCode)) {
			return fail(400, {
				name,
				email,
				joinCode,
				error: 'Join code must be 2–6 characters using only A–Z and 1–9.'
			});
		}

		try {
			await createMember({ name, email, joinCode });
			return { success: true };
		} catch (err) {
			console.error('Error creating member:', err);
			return fail(500, { name, email, joinCode, error: 'Something went wrong. Please try again.' });
		}
	}
};
