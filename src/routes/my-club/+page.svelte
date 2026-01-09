<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	
	let { data } = $props();
	let clubs = $state(data.clubs);
	let helpModal = $state({ open: false, clubName: null, loading: false, ambassador: null, error: null });

	function handleRefresh(clubName, refreshedClub) {
		clubs = clubs.map(c => c.name === clubName ? mergeClubData(c, refreshedClub) : c);
	}

	async function openHelpModal(clubName) {
		helpModal = { open: true, clubName, loading: true, ambassador: null, error: null };
		try {
			const response = await fetch(`/api/club/ambassador?club_name=${encodeURIComponent(clubName)}`);
			if (!response.ok) {
				const data = await response.json();
				helpModal = { ...helpModal, loading: false, error: data.error || 'Failed to load ambassador' };
				return;
			}
			const ambassador = await response.json();
			helpModal = { ...helpModal, loading: false, ambassador };
		} catch (err) {
			helpModal = { ...helpModal, loading: false, error: 'Failed to load ambassador' };
		}
	}

	function closeHelpModal() {
		helpModal = { open: false, clubName: null, loading: false, ambassador: null, error: null };
	}
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
		{#if clubs.length > 0}
			<div class="clubs-grid">
				{#each clubs as club}
					<div class="club-card">
						<div class="club-header">
							<h3 class="club-name">{club.name}</h3>
							<div class="club-badges">
								<button class="contact-us-button" onclick={() => openHelpModal(club.name)} title="Contact your ambassador">
									<img 
										src="https://icons.hackclub.com/api/icons/black/message-simple-fill" 
										alt="Contact icon"
										width="24"
										height="24"
									/>
									<span>Contact Us</span>
								</button>
								<RefreshButton clubName={club.name} onRefresh={(refreshedClub) => handleRefresh(club.name, refreshedClub)} />
								{#if club.level}
									<span class="club-level">{club.level}</span>
								{/if}
								<span class="club-role {club.role}">{club.role}</span>
							</div>
						</div>

						<div class="stats-row">
							<a href="/my-club/{encodeURIComponent(club.name)}/members" class="stat-card">
								<span class="stat-number">{club.members?.length || 0}</span>
								<span class="stat-label">Members</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/ships" class="stat-card">
								<span class="stat-number">{club.ships?.length || 0}</span>
								<span class="stat-label">Ships</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/levels" class="stat-card">
								<span class="stat-number">{(club.level || 'level 1').replace('level ', '')}</span>
								<span class="stat-label">Club Level</span>
							</a>
							{#if club.role === 'leader'}
								<a href="/my-club/{encodeURIComponent(club.name)}/manage" class="stat-card manage-card">
									<img 
										src="https://icons.hackclub.com/api/icons/black/settings" 
										alt="Manage icon"
										width="32"
										height="32"
									/>
									<span class="stat-label">Manage Club</span>
								</a>
							{/if}
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

<Modal open={helpModal.open} title="Contact Us" onClose={closeHelpModal}>
	{#if helpModal.loading}
		<p class="loading-text">Loading ambassador info...</p>
	{:else if helpModal.error}
		<p class="error-text">{helpModal.error}</p>
	{:else if helpModal.ambassador}
		<p class="help-intro">How would you like to contact your ambassador?</p>
		<div class="contact-options">
			{#if helpModal.ambassador.email}
				<a href="mailto:{helpModal.ambassador.email}" class="btn email-button">
					Email
				</a>
			{/if}
			{#if helpModal.ambassador.slackId}
				<a href="https://hackclub.enterprise.slack.com/team/{helpModal.ambassador.slackId}" target="_blank" rel="noopener noreferrer" class="btn slack-button">
					Slack
				</a>
			{/if}
		</div>
	{:else}
		<p class="error-text">No ambassador assigned to this club.</p>
	{/if}
</Modal>



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
		font-family: inherit;
		transition: all 0.2s;
		border: 2px solid var(--red);
		cursor: pointer;
		background-color: var(--red);
		color: var(--white);
		box-shadow: none;
	}

	.nav-button:hover {
		opacity: 0.9;
		box-shadow: none;
		transform: scale(1.0625);
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
		display: inline-flex;
		align-items: center;
		padding: 8px 14px;
		background-color: #dcfce7;
		border: 2px solid #dcfce7;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 700;
		color: #166534;
	}

	.club-role {
		display: inline-flex;
		align-items: center;
		padding: 8px 14px;
		border: 2px solid transparent;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 700;
	}

	.club-role.leader {
		background-color: #fef3c7;
		border-color: #fef3c7;
		color: #92400e;
	}

	.club-role.member {
		background-color: #dbeafe;
		border-color: #dbeafe;
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

	.manage-card {
		justify-content: center;
	}

	.manage-card img {
		width: 32px;
		height: 32px;
		margin-bottom: 8px;
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

	.contact-us-button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.contact-us-button:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.contact-us-button img {
		flex-shrink: 0;
	}

	.contact-us-button span {
		white-space: nowrap;
	}

	.loading-text {
		color: #8492a6;
		text-align: center;
		margin: 0;
	}

	.error-text {
		color: #ec3750;
		text-align: center;
		margin: 0;
	}

	.help-intro {
		color: #1f2d3d;
		text-align: center;
		margin: 0 0 20px 0;
	}

	.contact-options {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.email-button,
	.slack-button {
		flex: 1;
		text-align: center;
	}

	.slack-button {
		background-color: var(--green) !important;
		border-color: var(--green) !important;
	}
</style>
