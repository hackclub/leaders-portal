<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>My Memberships - Hack Club</title>
</svelte:head>

<div class="page-wrapper">
	<header class="page-header">
		<div class="header-content">
			<h1>My Memberships</h1>
			<p>View announcements and events from clubs you've joined</p>
		</div>
	</header>

	{#if data.clubs.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
					<circle cx="9" cy="7" r="4"/>
					<line x1="19" y1="8" x2="19" y2="14"/>
					<line x1="22" y1="11" x2="16" y2="11"/>
				</svg>
			</div>
			<h2>No club memberships yet</h2>
			<p>Ask a club leader for a join link to become a member.</p>
		</div>
	{:else}
		<div class="clubs-container">
			{#each data.clubs as club}
				<a href="/member/{club.slug}" class="club-card">
					<div class="club-avatar">
						{club.name.charAt(0).toUpperCase()}
					</div>
					<div class="club-info">
						<h3>{club.name}</h3>
						<p class="club-meta">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
								<line x1="16" y1="2" x2="16" y2="6"/>
								<line x1="8" y1="2" x2="8" y2="6"/>
								<line x1="3" y1="10" x2="21" y2="10"/>
							</svg>
							Joined {new Date(club.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</p>
					</div>
					<svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-wrapper {
		width: 100%;
		min-height: 100%;
		padding: 32px;
	}

	.page-header {
		margin-bottom: 32px;
		padding-bottom: 24px;
		border-bottom: 1px solid #e0e6ed;
	}

	.header-content h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.header-content p {
		color: #8492a6;
		margin: 0;
		font-size: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 80px 32px;
		background: #f9fafb;
		border-radius: 16px;
		border: 1px solid #e0e6ed;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		background: #e5e7eb;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
		color: #8492a6;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		color: #1f2d3d;
		margin: 0 0 8px 0;
		font-weight: 600;
	}

	.empty-state p {
		color: #8492a6;
		margin: 0;
	}

	.clubs-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.club-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px 24px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.club-card:hover {
		border-color: #ec3750;
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.08);
	}

	.club-avatar {
		width: 48px;
		height: 48px;
		background: #ec3750;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.club-info {
		flex: 1;
		min-width: 0;
	}

	.club-info h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 4px 0;
	}

	.club-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #8492a6;
		font-size: 0.875rem;
		margin: 0;
	}

	.arrow-icon {
		color: #c0ccda;
		flex-shrink: 0;
		transition: color 0.2s, transform 0.2s;
	}

	.club-card:hover .arrow-icon {
		color: #ec3750;
		transform: translateX(4px);
	}

	/* Dark mode */
	:global(.dark) .page-header {
		border-bottom-color: #333;
	}

	:global(.dark) .header-content h1 {
		color: #f0f0f0;
	}

	:global(.dark) .header-content p {
		color: #888;
	}

	:global(.dark) .empty-state {
		background: #1e1e2e;
		border-color: #333;
	}

	:global(.dark) .empty-icon {
		background: #2a2a3e;
		color: #666;
	}

	:global(.dark) .empty-state h2 {
		color: #f0f0f0;
	}

	:global(.dark) .empty-state p {
		color: #888;
	}

	:global(.dark) .club-card {
		background: #1e1e2e;
		border-color: #333;
	}

	:global(.dark) .club-card:hover {
		border-color: #ec3750;
	}

	:global(.dark) .club-info h3 {
		color: #f0f0f0;
	}

	:global(.dark) .club-meta {
		color: #888;
	}

	:global(.dark) .arrow-icon {
		color: #555;
	}

	@media (max-width: 768px) {
		.page-wrapper {
			padding: 20px;
		}

		.header-content h1 {
			font-size: 1.5rem;
		}

		.club-card {
			padding: 16px;
		}
	}
</style>
