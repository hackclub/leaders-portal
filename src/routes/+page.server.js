import { redirect } from '@sveltejs/kit';

const HOME_PREFERENCE_COOKIE = 'homePreference';

export async function load({ locals, cookies }) {
	const user = locals.userPublic || null;
	const homePreference = cookies.get(HOME_PREFERENCE_COOKIE) || null;

	// Signed-in members always land on the member home page.
	if (user && user.provider === 'member') {
		throw redirect(302, '/members');
	}

	// Non signed-in visitors who chose to view the member side land on the
	// member home page automatically when visiting "/".
	if (!user && homePreference === 'member') {
		throw redirect(302, '/members');
	}

	// Only prompt non signed-in visitors who haven't made a choice yet.
	const showPortalSwitchBanner = !user && !homePreference;

	return {
		user,
		showPortalSwitchBanner
	};
}
