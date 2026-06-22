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
		<h2 class="section-title">All Ships ({club.ships.length})</h2>
		
		{#if club.ships && club.ships.length > 0}
			<div class="ships-grid">
				{#each club.ships as ship}
					<div class="ship-card">
						<div class="ship-info">
							<span class="ship-name">{ship.ysws} - {ship.email}</span>
						</div>
						{#if ship.codeUrl}
							<a href={ship.codeUrl} target="_blank" rel="noopener noreferrer" class="ship-link">
								View Code →
							</a>
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
		background: #f9fafc;
		border: 2px solid #e0e6ed;
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
		color: #1f2d3d;
		margin: 0 0 4px 0;
	}

	.submit-text {
		font-size: 14px;
		color: #8492a6;
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

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 16px 0;
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
		background: white;
		border: 2px solid #e0e6ed;
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
		background: #fff0f2;
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
		color: #1f2d3d;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		background: #f9fafc;
		padding: 48px;
		border-radius: 12px;
		border: 2px dashed #e0e6ed;
		text-align: center;
	}

	.empty-state p {
		color: #8492a6;
		font-size: 18px;
		margin: 0;
	}
</style>
