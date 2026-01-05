export function createClubRefreshHandler(getClub, setClub) {
	return function handleRefresh(refreshedClub) {
		const currentClub = getClub();
		setClub({
			...currentClub,
			...refreshedClub,
			role: currentClub.role
		});
	};
}

export function mergeClubData(currentClub, refreshedClub) {
	return {
		...currentClub,
		...refreshedClub,
		role: currentClub.role
	};
}
