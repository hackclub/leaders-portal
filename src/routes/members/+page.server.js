export async function load({ locals }) {
	return {
		user: locals.userPublic || null
	};
}
