<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Leaderboard - Club Leaders Portal</title>
</svelte:head>

<div class="leaderboard-page">
	<header class="page-header">
		<a href="/" class="back-link">← Back to Home</a>
		<h1>🏆 Club Leaderboard</h1>
		<p class="subtitle">Clubs ranked by number of ships</p>
		<div class="stats">
			<span class="stat-pill">{data.totalClubs} Clubs</span>
			<span class="stat-pill">{data.totalShips} Total Ships</span>
		</div>
	</header>

	<div class="leaderboard-container">
		{#if data.clubs.length === 0}
			<div class="empty-state">
				<p>No clubs found. Check back soon!</p>
			</div>
		{:else}
			<div class="leaderboard-list">
				{#each data.clubs as club, index}
					<div class="leaderboard-item" class:top-3={index < 3}>
						<div class="rank-badge" class:gold={index === 0} class:silver={index === 1} class:bronze={index === 2}>
							{#if index === 0}
								🥇
							{:else if index === 1}
								🥈
							{:else if index === 2}
								🥉
							{:else}
								{club.rank}
							{/if}
						</div>
						
						<div class="club-info">
							<h3 class="club-name">{club.name}</h3>
							<div class="club-meta">
								{#if club.location}
									<span class="meta-item">📍 {club.location}</span>
								{/if}
								{#if club.level}
									<span class="meta-item">⭐ Level {club.level}</span>
								{/if}
								<span class="meta-item">👥 {club.membersCount} members</span>
							</div>
						</div>
						
						<div class="ships-count">
							<div class="ships-number">{club.shipsCount}</div>
							<div class="ships-label">ships</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.leaderboard-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 40px 20px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.page-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 20px;
		color: #338eda;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-header h1 {
		font-size: 48px;
		margin: 0 0 8px 0;
		color: #1f2d3d;
		font-weight: 900;
	}

	.subtitle {
		font-size: 18px;
		color: #8492a6;
		margin: 0 0 20px 0;
	}

	.stats {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-top: 16px;
	}

	.stat-pill {
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 999px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 700;
		color: #1f2d3d;
	}

	.leaderboard-container {
		background: white;
		border-radius: 12px;
		border: 2px solid #e0e6ed;
		overflow: hidden;
	}

	.leaderboard-list {
		display: flex;
		flex-direction: column;
	}

	.leaderboard-item {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 24px;
		border-bottom: 2px solid #e0e6ed;
		transition: background-color 0.2s;
	}

	.leaderboard-item:last-child {
		border-bottom: none;
	}

	.leaderboard-item:hover {
		background-color: #f9fafc;
	}

	.leaderboard-item.top-3 {
		background-color: #fffbf0;
	}

	.leaderboard-item.top-3:hover {
		background-color: #fff4d6;
	}

	.rank-badge {
		min-width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 900;
		border-radius: 50%;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		color: #1f2d3d;
	}

	.rank-badge.gold {
		background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
		border-color: #ffd700;
		font-size: 32px;
	}

	.rank-badge.silver {
		background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
		border-color: #c0c0c0;
		font-size: 32px;
	}

	.rank-badge.bronze {
		background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
		border-color: #cd7f32;
		font-size: 32px;
	}

	.club-info {
		flex: 1;
		min-width: 0;
	}

	.club-name {
		font-size: 20px;
		font-weight: 800;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.club-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 14px;
		color: #8492a6;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.ships-count {
		text-align: center;
		min-width: 80px;
	}

	.ships-number {
		font-size: 32px;
		font-weight: 900;
		color: #ec3750;
		line-height: 1;
	}

	.ships-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.empty-state {
		padding: 60px 20px;
		text-align: center;
		color: #8492a6;
		font-size: 18px;
	}

	@media (max-width: 640px) {
		.page-header h1 {
			font-size: 36px;
		}

		.leaderboard-item {
			padding: 16px;
			gap: 12px;
		}

		.rank-badge {
			min-width: 40px;
			height: 40px;
			font-size: 20px;
		}

		.rank-badge.gold,
		.rank-badge.silver,
		.rank-badge.bronze {
			font-size: 28px;
		}

		.club-name {
			font-size: 18px;
		}

		.club-meta {
			flex-direction: column;
			gap: 4px;
		}

		.ships-number {
			font-size: 24px;
		}

		.ships-label {
			font-size: 12px;
		}
	}
</style>
