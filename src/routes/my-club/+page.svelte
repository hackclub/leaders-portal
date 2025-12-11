<script>
	import LevelCard from '$lib/LevelCard.svelte';
	
	let { data } = $props();
</script>

<svelte:head>
	<title>My Club - Clubs Event Portal</title>
</svelte:head>

<div class="container">
	<header>
		<h1 class="page-title">My Club</h1>
		<div class="header-buttons">
			<a href="/" class="nav-button">Home</a>
			<form method="POST" action="/logout" style="display: inline;">
				<button type="submit" class="nav-button">Logout</button>
			</form>
		</div>
	</header>

	<section class="clubs-info">
		{#if data.clubs.length > 0}
			<div class="clubs-grid">
				{#each data.clubs as club}
					<div class="club-card">
						<div class="club-header">
							<h3 class="club-name">{club.name}</h3>
							<div class="club-badges">
								{#if club.level}
									<span class="club-level">{club.level}</span>
								{/if}
								<span class="club-role {club.role}">{club.role}</span>
							</div>
						</div>

						<LevelCard currentLevel={club.level || 'Bronze'} clubShips={club.ships.length || 0} />

						<div class="stats-row">
							<a href="/my-club/{encodeURIComponent(club.name)}/members" class="stat-card">
								<span class="stat-number">{club.members?.length || 0}</span>
								<span class="stat-label">Members</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/ships" class="stat-card">
								<span class="stat-number">{club.ships?.length || 0}</span>
								<span class="stat-label">Ships</span>
							</a>
						</div>

						{#if club.joinCode}
							<div class="invite-section">
								<span class="invite-label">Invite link:</span>
								<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="invite-link">
									hack.club/join/{club.joinCode}
								</a>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>You are not a member of any clubs yet.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	@font-face {
		font-family: 'Phantom Sans';
		src: url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff') format('woff'),
			url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2') format('woff2');
		font-weight: normal;
		font-style: normal;
		font-display: swap;
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.page-title {
		font-size: 48px;
		font-weight: bold;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.nav-button {
		padding: 10px 20px;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		font-size: 14px;
		border: 2px solid #ec3750;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
		background-color: #ec3750;
		color: white;
	}

	.nav-button:hover {
		background-color: #d62c47;
		border-color: #d62c47;
	}

	.clubs-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.club-card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 24px;
	}

	.club-card:hover {
		border-color: #ec3750;
	}

	.club-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 16px;
	}

	.club-name {
		font-size: 24px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
		flex: 1;
	}

	.club-badges {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.club-level {
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background-color: #dcfce7;
		color: #166534;
	}

	.club-role {
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.club-role.leader {
		background-color: #fef3c7;
		color: #92400e;
	}

	.club-role.member {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.stats-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-top: 20px;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
	}

	.stat-card:hover {
		border-color: #ec3750;
		background: #fff5f7;
	}

	.stat-number {
		font-size: 36px;
		font-weight: bold;
		color: #ec3750;
	}

	.stat-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 4px;
	}

	.invite-section {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.invite-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
	}

	.invite-link {
		font-size: 14px;
		font-weight: 600;
		color: #338eda;
		text-decoration: none;
	}

	.invite-link:hover {
		text-decoration: underline;
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
