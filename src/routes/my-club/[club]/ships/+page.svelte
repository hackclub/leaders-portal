<script>
	import LevelCard from '$lib/LevelCard.svelte';
	import RefreshButton from '$lib/RefreshButton.svelte';
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

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{club.name}</h1>
			<p class="page-subtitle">Ships</p>
		</div>
		<div class="header-buttons">
			<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
		</div>
	</header>

	<div class="level-section">
		<LevelCard currentLevel={club.level || 'Bronze'} clubShips={club.ships.length || 0} />
	</div>

	<div class="submit-banner">
		<div class="submit-content">
			<h3 class="submit-title">Link a shipped project to your club</h3>
			<p class="submit-text">Fill out the form to add your projects and help your club level up!</p>
		</div>
		<a href="https://forms.hackclub.com/club-ships" target="_blank" rel="noopener noreferrer" class="submit-btn">
			Submit Ship
		</a>
	</div>

	<section class="ships-section">
		<h2 class="section-title">All Ships ({club.ships.length})</h2>
		
		{#if club.ships && club.ships.length > 0}
			<div class="ships-grid">
				{#each club.ships as ship}
					<div class="ship-card">
						<div class="ship-icon">🚀</div>
						<div class="ship-info">
							<span class="ship-name">{ship.name}</span>
							<span class="ship-author">by {ship.memberName}</span>
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
		padding: 32px 16px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.back-link {
		font-size: 14px;
		color: #8492a6;
		text-decoration: none;
		font-weight: 500;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 36px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
	}

	.page-subtitle {
		font-size: 18px;
		color: #ec3750;
		font-weight: 600;
		margin: 0;
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
		font-size: 24px;
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

	.ship-author {
		font-size: 14px;
		color: #8492a6;
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
