<script>
	import LevelCard from '$lib/LevelCard.svelte';
	import RefreshButton from '$lib/RefreshButton.svelte';
	import SiteNav from '$lib/SiteNav.svelte';
	import ClubHeader from '$lib/ClubHeader.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	
	let { data } = $props();
	let club = $state(data.club);

	function handleRefresh(refreshedClub) {
		club = mergeClubData(club, refreshedClub);
	}

	let totalHours = $derived(
		(club.ships ?? []).reduce((sum, ship) => sum + (Number(ship.hoursSpent) || 0), 0)
	);

	let groupedShips = $derived.by(() => {
		const groups = new Map();
		for (const ship of club.ships ?? []) {
			const key = ship.ysws || 'Other';
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(ship);
		}
		return [...groups.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([ysws, ships]) => ({
				ysws,
				ships,
				hours: ships.reduce((sum, ship) => sum + (Number(ship.hoursSpent) || 0), 0)
			}));
	});

	let expanded = $state({});

	function toggleGroup(event, ysws) {
		expanded[ysws] = !expanded[ysws];
		event.currentTarget.blur();
	}
</script>

<svelte:head>
	<title>Ships - {club.name} - Clubs Event Portal</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<ClubHeader clubName={club.name} section="Club Ships">
		<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
	</ClubHeader>



	<section class="ships-section">
		<div class="section-header">
			<h2 class="section-title">All Ships ({club.ships.length})</h2>

		</div>
		
		{#if club.ships && club.ships.length > 0}
			<div class="ysws-groups">
				{#each groupedShips as group}
					<div class="ysws-group">
						<button
							type="button"
							class="ysws-header"
							aria-expanded={!!expanded[group.ysws]}
							onclick={(event) => toggleGroup(event, group.ysws)}
						>
							<span class="ysws-toggle" class:collapsed={!expanded[group.ysws]}>▾</span>
							<span class="ysws-title">{group.ysws}</span>
							{#if group.hours > 0}
								<span class="ysws-hours">{group.hours} {group.hours === 1 ? 'hour' : 'hours'}</span>
							{/if}
							<span class="ysws-count">{group.ships.length}</span>
						</button>
						{#if expanded[group.ysws]}
							<div class="ships-grid">
								{#each group.ships as ship}
									<div class="ship-card">
										<div class="ship-info">
											<span class="ship-name">{ship.email}</span>
											{#if ship.hoursSpent != null}
												<span class="ship-hours">{ship.hoursSpent} {ship.hoursSpent === 1 ? 'hour' : 'hours'} spent</span>
											{/if}
										</div>
										{#if ship.codeUrl}
											<a href={ship.codeUrl} target="_blank" rel="noopener noreferrer" class="ship-link">
												View Code →
											</a>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No ships yet. Submit your first project to get started!</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px 48px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.level-section {
		margin-bottom: 24px;
	}

	.submit-banner {
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 20px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 32px;
	}

	.submit-content {
		flex: 1;
	}

	.submit-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 4px 0;
	}

	.submit-text {
		font-size: 14px;
		color: var(--color-muted);
		margin: 0;
	}

	.submit-btn {
		padding: 12px 24px;
		background-color: #ec3750;
		color: white;
		border: 2px solid #ec3750;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		font-family: 'Phantom Sans', sans-serif;
		white-space: nowrap;
	}

	.submit-btn:hover {
		background-color: #d62c47;
		border-color: #d62c47;
	}

	.section-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin: 0 0 16px 0;
	}

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.total-hours {
		font-size: 15px;
		font-weight: 600;
		color: #33d6a6;
		white-space: nowrap;
	}

	.ysws-groups {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.ysws-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ysws-header {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 12px 16px;
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		text-align: left;
	}

	.ysws-header:hover {
		border-color: #ec3750;
	}

	.ysws-toggle {
		font-size: 14px;
		color: var(--color-muted);
		transition: transform 0.15s ease;
	}

	.ysws-toggle.collapsed {
		transform: rotate(-90deg);
	}

	.ysws-title {
		flex: 1;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
	}

	.ysws-hours {
		font-size: 13px;
		font-weight: 600;
		color: #33d6a6;
		white-space: nowrap;
	}

	.ysws-count {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
		background: var(--bg-card);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 2px 10px;
	}

	.ships-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ship-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 8px;
	}

	.ship-card:hover {
		border-color: #ec3750;
	}

	.ship-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
		font-size: 22px;
		flex-shrink: 0;
	}

	.ship-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.ship-name {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ship-hours {
		font-size: 14px;
		color: var(--color-muted);
	}

	.ship-link {
		font-size: 14px;
		color: #ec3750;
		text-decoration: none;
		font-weight: 600;
		padding: 8px 16px;
		border: 2px solid #ec3750;
		border-radius: 6px;
		white-space: nowrap;
	}

	.ship-link:hover {
		background-color: #ec3750;
		color: white;
	}

	.empty-state {
		background: var(--bg-sunken);
		padding: 48px;
		border-radius: 12px;
		border: 2px dashed var(--color-border);
		text-align: center;
	}

	.empty-state p {
		color: var(--color-muted);
		font-size: 18px;
		margin: 0;
	}
</style>
