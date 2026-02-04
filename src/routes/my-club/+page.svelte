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

	function getClubSlug(name) {
		return name.toLowerCase().replace(/\s+/g, '-');
	}
</script>

<svelte:head>
	<title>My Clubs - Hack Club</title>
</svelte:head>

<div class="page-wrapper">
	<header class="page-header">
		<div class="header-content">
			<h1>My Clubs</h1>
			<p>Manage your clubs, view members, and track your progress</p>
		</div>
		<div class="header-actions">
			<a href="https://hackclub.com/clubs/" target="_blank" rel="noopener" class="btn btn-outline">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				Start New Club
			</a>
		</div>
	</header>

	{#if clubs.length > 0}
		<div class="clubs-container">
			{#each clubs as club}
				<section class="club-section">
					<!-- Club Header -->
					<div class="club-header">
						<div class="club-identity">
							<div class="club-avatar">
								{club.name.charAt(0).toUpperCase()}
							</div>
							<div class="club-info">
								<h2>{club.name}</h2>
								<div class="club-meta">
									{#if club.location}
										<span class="meta-item">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
												<circle cx="12" cy="10" r="3"/>
											</svg>
											{club.location}
										</span>
									{/if}
									<span class="meta-item role" class:leader={club.role === 'leader'}>
										{club.role === 'leader' ? '👑 Leader' : '👤 Member'}
									</span>
								</div>
							</div>
						</div>
						<div class="club-badges">
							{#if club.level}
								<div class="level-badge">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
									</svg>
									{club.level}
								</div>
							{/if}
							{#if club.isSuspended}
								<span class="badge-suspended">Suspended</span>
							{/if}
							<RefreshButton clubName={club.name} onRefresh={(refreshedClub) => handleRefresh(club.name, refreshedClub)} />
						</div>
					</div>

					{#if club.isSuspended}
						<!-- Suspended Club Notice -->
						<div class="suspended-notice">
							<div class="suspended-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="12" cy="12" r="10"></circle>
									<line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
								</svg>
							</div>
							<div class="suspended-content">
								<h3>This Club is Suspended</h3>
								<p>Access to this club's features has been temporarily restricted.</p>
								{#if club.suspensionReason}
									<div class="suspension-reason">
										<strong>Reason:</strong> {club.suspensionReason}
									</div>
								{/if}
								{#if club.suspendedAt}
									<p class="suspension-date">
										Suspended on {new Date(club.suspendedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
									</p>
								{/if}
								<p class="contact-text">
									If you believe this is a mistake, please contact <a href="mailto:clubs@hackclub.com">clubs@hackclub.com</a>
								</p>
							</div>
						</div>
					{:else}
					<!-- Stats Cards Row -->
					<div class="stats-row">
						<div class="stat-card">
							<div class="stat-icon blue">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
									<circle cx="9" cy="7" r="4"/>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
								</svg>
							</div>
							<div class="stat-data">
								<span class="stat-number">{club.members?.length || 0}</span>
								<span class="stat-label">Members</span>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon red">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
									<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
								</svg>
							</div>
							<div class="stat-data">
								<span class="stat-number">{club.ships?.length || 0}</span>
								<span class="stat-label">Ships</span>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon amber">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
								</svg>
							</div>
							<div class="stat-data">
								<span class="stat-number">{(club.level || 'level 1').replace('level ', '')}</span>
								<span class="stat-label">Level</span>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon green">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
							</div>
							<div class="stat-data">
								<span class="stat-number">0</span>
								<span class="stat-label">Events</span>
							</div>
						</div>
					</div>

					<!-- Quick Actions Grid -->
					<div class="actions-section">
						<h3>Quick Actions</h3>
						<div class="actions-grid">
							<a href="/my-club/{encodeURIComponent(club.name)}/members" class="action-btn">
								<div class="action-icon blue">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="9" cy="7" r="4"/>
										<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
										<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
									</svg>
								</div>
								<span>View Members</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/ships" class="action-btn">
								<div class="action-icon red">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
										<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
									</svg>
								</div>
								<span>View Ships</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/levels" class="action-btn">
								<div class="action-icon amber">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
									</svg>
								</div>
								<span>Level Progress</span>
							</a>
							<a href="/invite-coleader?club={encodeURIComponent(club.name)}" class="action-btn">
								<div class="action-icon purple">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="8.5" cy="7" r="4"/>
										<line x1="20" y1="8" x2="20" y2="14"/>
										<line x1="23" y1="11" x2="17" y2="11"/>
									</svg>
								</div>
								<span>Add Co-Leader</span>
							</a>
							<a href="/posters?club={encodeURIComponent(club.name)}" class="action-btn">
								<div class="action-icon pink">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
										<circle cx="8.5" cy="8.5" r="1.5"/>
										<polyline points="21,15 16,10 5,21"/>
									</svg>
								</div>
								<span>Create Poster</span>
							</a>
							<button class="action-btn" onclick={() => openHelpModal(club.name)}>
								<div class="action-icon teal">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"/>
										<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
										<line x1="12" y1="17" x2="12.01" y2="17"/>
									</svg>
								</div>
								<span>Get Help</span>
							</button>
							{#if club.role === 'leader'}
								<a href="/my-club/{encodeURIComponent(club.name)}/manage" class="action-btn highlight">
									<div class="action-icon green">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="3"/>
											<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
										</svg>
									</div>
									<span>Manage Club</span>
								</a>
								<a href="/my-club/{encodeURIComponent(club.name)}/announcements" class="action-btn">
									<div class="action-icon orange">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="m3 11 18-5v12L3 13v-2z"/>
											<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
										</svg>
									</div>
									<span>Announcements</span>
								</a>
								<a href="/my-club/{encodeURIComponent(club.name)}/events" class="action-btn">
									<div class="action-icon cyan">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
											<line x1="16" y1="2" x2="16" y2="6"/>
											<line x1="8" y1="2" x2="8" y2="6"/>
											<line x1="3" y1="10" x2="21" y2="10"/>
										</svg>
									</div>
									<span>Club Events</span>
								</a>
							{/if}
						</div>
					</div>

					<!-- Links Section -->
					{#if club.joinCode || club.clubWebsite}
						<div class="links-section">
							<h3>Club Links</h3>
							<div class="links-grid">
								{#if club.joinCode}
									<div class="link-card">
										<div class="link-card-header">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
												<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
											</svg>
											<span>Join Code</span>
										</div>
										<code class="link-code">{club.joinCode}</code>
										<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener" class="link-url">
											hack.club/join/{club.joinCode}
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
											</svg>
										</a>
									</div>
								{/if}
								{#if club.clubWebsite}
									<div class="link-card">
										<div class="link-card-header">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<circle cx="12" cy="12" r="10"/>
												<line x1="2" y1="12" x2="22" y2="12"/>
												<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
											</svg>
											<span>Club Page</span>
										</div>
										<a href="https://hack.club/club/{getClubSlug(club.name)}" target="_blank" rel="noopener" class="link-url">
											hack.club/club/{getClubSlug(club.name)}
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
											</svg>
										</a>
									</div>
								{/if}
							</div>
						</div>
					{/if}
					{/if}
				</section>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
					<polyline points="9,22 9,12 15,12 15,22"/>
				</svg>
			</div>
			<h2>No clubs yet</h2>
			<p>You're not a member of any clubs yet. Start your own Hack Club or join an existing one!</p>
			<div class="empty-actions">
				<a href="https://hackclub.com/clubs/" target="_blank" rel="noopener" class="btn btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"/>
						<line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
					Start a Club
				</a>
				<a href="https://hackclub.com/slack/" target="_blank" rel="noopener" class="btn btn-outline">
					Join the Slack
				</a>
			</div>
		</div>
	{/if}
</div>

<Modal open={helpModal.open} title="Contact Support" onClose={closeHelpModal}>
	{#if helpModal.loading}
		<div class="modal-center">
			<div class="spinner"></div>
			<p>Loading...</p>
		</div>
	{:else if helpModal.error}
		<div class="modal-center">
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
				<line x1="12" y1="9" x2="12" y2="13"/>
				<line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
			<p>{helpModal.error}</p>
		</div>
	{:else if helpModal.ambassador}
		<div class="ambassador-info">
			{#if helpModal.ambassador.pfp}
				<img src={helpModal.ambassador.pfp} alt="" class="ambassador-avatar" />
			{/if}
			{#if helpModal.ambassador.desc}
				<p class="ambassador-bio">{helpModal.ambassador.desc}</p>
			{/if}
		</div>
		<p class="contact-text">How would you like to reach out?</p>
		<div class="contact-options">
			{#if helpModal.ambassador.email}
				<a href="mailto:{helpModal.ambassador.email}" class="btn btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
						<polyline points="22,6 12,13 2,6"/>
					</svg>
					Email
				</a>
			{/if}
			{#if helpModal.ambassador.slackId}
				<a href="https://hackclub.enterprise.slack.com/team/{helpModal.ambassador.slackId}" target="_blank" rel="noopener" class="btn btn-success">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
					</svg>
					Slack
				</a>
			{/if}
		</div>
	{:else}
		<div class="modal-center">
			<span class="modal-emoji">😕</span>
			<p>No ambassador assigned to this club.</p>
		</div>
	{/if}
</Modal>



<style>
	/* Page Wrapper - Full Width */
	.page-wrapper {
		width: 100%;
		min-height: 100%;
		padding: 32px;
	}

	/* Page Header */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24px;
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.header-content h1 {
		margin: 0 0 8px;
		font-size: 2rem;
		color: #1f2d3d;
	}

	.header-content p {
		margin: 0;
		color: #8492a6;
		font-size: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		font-weight: 600;
		font-size: 0.9rem;
		border-radius: 10px;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
		border: none;
	}

	.btn-primary {
		background: #ec3750;
		color: white;
	}

	.btn-primary:hover {
		background: #d32f44;
	}

	.btn-outline {
		background: white;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
	}

	.btn-outline:hover {
		border-color: #ec3750;
		color: #ec3750;
	}

	/* Clubs Container */
	.clubs-container {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	/* Club Section - Full Width Card */
	.club-section {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 20px;
		padding: 28px;
		animation: fadeInUp 0.5s ease-out both;
		transition: box-shadow 0.3s ease, transform 0.3s ease;
	}

	.club-section:hover {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
	}

	.clubs-container .club-section:nth-child(1) { animation-delay: 0.05s; }
	.clubs-container .club-section:nth-child(2) { animation-delay: 0.15s; }
	.clubs-container .club-section:nth-child(3) { animation-delay: 0.25s; }

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Club Header */
	.club-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.club-identity {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.club-avatar {
		width: 56px;
		height: 56px;
		background: #ec3750;
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 14px;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.club-section:hover .club-avatar {
		transform: scale(1.05) rotate(-3deg);
	}

	.club-info h2 {
		margin: 0 0 6px;
		font-size: 1.5rem;
		color: #1f2d3d;
	}

	.club-meta {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: #8492a6;
	}

	.meta-item.role {
		font-weight: 600;
	}

	.meta-item.role.leader {
		color: #f59e0b;
	}

	.club-badges {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.level-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: #33d6a6;
		color: white;
		font-size: 0.8rem;
		font-weight: 700;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	/* Stats Row */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 28px;
	}

	.stat-card {
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 14px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.stat-icon {
		width: 50px;
		height: 50px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-icon.blue { background: rgba(51, 142, 218, 0.1); color: #338eda; }
	.stat-icon.red { background: rgba(236, 55, 80, 0.1); color: #ec3750; }
	.stat-icon.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
	.stat-icon.green { background: rgba(51, 214, 166, 0.1); color: #33d6a6; }

	.stat-data {
		display: flex;
		flex-direction: column;
	}

	.stat-number {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2d3d;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.8rem;
		color: #8492a6;
		margin-top: 4px;
	}

	/* Actions Section */
	.actions-section {
		margin-bottom: 28px;
	}

	.actions-section h3,
	.links-section h3 {
		font-size: 1rem;
		color: #8492a6;
		margin: 0 0 16px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 12px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 18px;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		text-decoration: none;
		color: #1f2d3d;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s;
		cursor: pointer;
	}

	.action-btn:hover {
		background: white;
		border-color: #ec3750;
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.1);
	}

	.action-btn.highlight {
		background: rgba(51, 214, 166, 0.08);
		border-color: rgba(51, 214, 166, 0.3);
	}

	.action-btn.highlight:hover {
		border-color: #33d6a6;
		box-shadow: 0 4px 12px rgba(51, 214, 166, 0.15);
	}

	.action-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.action-icon.blue { background: rgba(51, 142, 218, 0.1); color: #338eda; }
	.action-icon.red { background: rgba(236, 55, 80, 0.1); color: #ec3750; }
	.action-icon.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
	.action-icon.green { background: rgba(51, 214, 166, 0.1); color: #33d6a6; }
	.action-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
	.action-icon.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
	.action-icon.teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
	.action-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
	.action-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

	/* Links Section */
	.links-section {
		padding-top: 24px;
		border-top: 1px solid #e0e6ed;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.link-card {
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		padding: 16px 20px;
	}

	.link-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		color: #8492a6;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.link-code {
		display: block;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 1.1rem;
		color: #1f2d3d;
		margin-bottom: 8px;
	}

	.link-url {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: #338eda;
		transition: color 0.2s;
	}

	.link-url:hover {
		color: #ec3750;
	}

	/* Empty State */
	.empty-state {
		background: white;
		border: 2px dashed #e0e6ed;
		border-radius: 20px;
		padding: 80px 40px;
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.empty-icon {
		width: 100px;
		height: 100px;
		background: #f9fafc;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
		color: #8492a6;
	}

	.empty-state h2 {
		margin: 0 0 12px;
		font-size: 1.5rem;
		color: #1f2d3d;
	}

	.empty-state p {
		margin: 0 0 32px;
		color: #8492a6;
		font-size: 1rem;
		line-height: 1.6;
	}

	.empty-actions {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Modal Content */
	.modal-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32px;
		text-align: center;
	}

	.modal-center p {
		margin: 12px 0 0;
		color: #8492a6;
	}

	.modal-emoji {
		font-size: 3rem;
	}

	.ambassador-info {
		text-align: center;
		margin-bottom: 24px;
	}

	.ambassador-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #e0e6ed;
		margin-bottom: 12px;
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	.ambassador-bio {
		color: #3c4858;
		margin: 0;
		line-height: 1.6;
	}

	.contact-text {
		text-align: center;
		color: #1f2d3d;
		font-weight: 600;
		margin: 0 0 20px;
	}

	.contact-options {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.contact-options .btn {
		flex: 1;
		justify-content: center;
	}

	.btn-success {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: #33d6a6;
		color: white;
		border-radius: 10px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.btn-success:hover {
		background: #2ab890;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e0e6ed;
		border-top-color: #ec3750;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.page-wrapper {
			padding: 24px 16px;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			justify-content: stretch;
		}

		.header-actions .btn {
			flex: 1;
			justify-content: center;
		}

		.club-header {
			flex-direction: column;
			align-items: stretch;
		}

		.club-badges {
			justify-content: flex-start;
		}

		.club-section {
			padding: 20px;
		}

		.stats-row {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.stat-card {
			padding: 16px;
		}

		.stat-number {
			font-size: 1.5rem;
		}

		.actions-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.contact-options {
			flex-direction: column;
		}
	}

	@media (max-width: 480px) {
		.stats-row {
			grid-template-columns: 1fr;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}

		.links-grid {
			grid-template-columns: 1fr;
		}

		.empty-state {
			padding: 48px 24px;
		}
	}

	/* Suspended Badge */
	.badge-suspended {
		display: inline-flex;
		align-items: center;
		padding: 6px 12px;
		background: #ec3750;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	/* Suspended Notice */
	.suspended-notice {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		padding: 24px;
		background: #fef2f2;
		border: 2px solid #fed7d7;
		border-radius: 16px;
		margin-top: 16px;
	}

	.suspended-icon {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		background: #ec3750;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.suspended-content h3 {
		margin: 0 0 8px 0;
		font-size: 1.1rem;
		color: #ec3750;
	}

	.suspended-content p {
		margin: 0 0 12px 0;
		font-size: 0.9rem;
		color: #8492a6;
		line-height: 1.5;
	}

	.suspension-reason {
		background: white;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 0.85rem;
		color: #1f2d3d;
		margin-bottom: 12px;
	}

	.suspension-reason strong {
		color: #ec3750;
	}

	.suspension-date {
		font-size: 0.8rem;
		color: #8492a6;
		font-style: italic;
	}

	.contact-text {
		margin-top: 8px;
	}

	.contact-text a {
		color: #338eda;
		font-weight: 600;
		text-decoration: none;
	}

	.contact-text a:hover {
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		.suspended-notice {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
	}
</style>
