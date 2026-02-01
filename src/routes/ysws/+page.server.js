export async function load({ parent }) {
	const data = await parent();
	return {
		user: data.user
	};
}
