import { fail } from '@sveltejs/kit';
import { getAirtableBase } from '$lib/server/airtable.js';

function escapeAirtableString(value) {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function createMigratedClub(clubName) {
	const clubsTable = getAirtableBase()('Clubs');
	const existingRecords = await clubsTable
		.select({
			filterByFormula: `LOWER({club_name}) = LOWER("${escapeAirtableString(clubName)}")`,
			fields: ['club_name'],
			maxRecords: 1
		})
		.firstPage();

	if (existingRecords.length > 0) {
		return false;
	}

	await clubsTable.create({
		club_name: clubName,
		team_notes: 'Automation - Migrate'
	});
	return true;
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const hasShipped = formData.get('hasShipped')?.toString();
		const clubName = formData.get('clubName')?.toString().trim();
		const memberEmail = formData.get('memberEmail')?.toString().trim().toLowerCase();

		if (!hasShipped || !clubName) {
			return fail(400, {
				error: 'Please answer all required questions.',
				hasShipped,
				clubName,
				memberEmail
			});
		}

		if (hasShipped !== 'yes' && hasShipped !== 'no') {
			return fail(400, {
				error: 'Please select whether your club has shipped a project.',
				hasShipped,
				clubName
			});
		}

		if (hasShipped === 'yes' && !memberEmail) {
			return fail(400, {
				error: 'Please enter the email of a member who shipped a project.',
				hasShipped,
				clubName
			});
		}

		if (hasShipped === 'no') {
			try {
				const created = await createMigratedClub(clubName);
				if (!created) {
					return fail(409, {
						error: 'Club already migrated',
						hasShipped,
						clubName,
						memberEmail
					});
				}
				return { success: true, hasShipped };
			} catch (error) {
				console.error('Error creating migrated club in Airtable:', error);
				return fail(500, {
					error: 'We could not migrate that club right now. Please try again.',
					hasShipped,
					clubName,
					memberEmail
				});
			}
		}

		try {
			const records = await getAirtableBase()('Unified DB Projects')
				.select({
					filterByFormula: `LOWER({Email}) = LOWER("${escapeAirtableString(memberEmail)}")`,
					fields: ['Email'],
					maxRecords: 1
				})
				.firstPage();

			if (records.length === 0) {
				return fail(404, {
					error: 'No shipped project was found for that member email.',
					hasShipped,
					clubName,
					memberEmail
				});
			}

			const created = await createMigratedClub(clubName);
			if (!created) {
				return fail(409, {
					error: 'Club already migrated',
					hasShipped,
					clubName,
					memberEmail
				});
			}
			return { success: true, hasShipped };
		} catch (error) {
			console.error('Error checking project or creating migrated club in Airtable:', error);
			return fail(500, {
				error: 'We could not migrate that club right now. Please try again.',
				hasShipped,
				clubName,
				memberEmail
			});
		}
	}
};
