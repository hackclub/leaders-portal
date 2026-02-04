<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import LevelCard from '$lib/LevelCard.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	
	let { data } = $props();
	let club = $state(data.club);
	let helpModal = $state({ open: false, loading: false, ambassador: null, error: null });

	function handleRefresh(clubName, refreshedClub) {
		club = mergeClubData(club, refreshedClub);
	}

	async function openHelpModal() {
		helpModal = { open: true, loading: true, ambassador: null, error: null };
		try {
			const response = await fetch(`/api/club/ambassador?club_name=${encodeURIComponent(club.name)}`);
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
		helpModal = { open: false, loading: false, ambassador: null, error: null };
	}

	function getClubSlug(name) {
		return name.toLowerCase().replace(/\s+/g, '-');
	}
</script>

<svelte:head>
	<title>{club.name} - Hack Club</title>
</svelte:head>

<div class="page-wrapper">
	<header class="page-header">
		<div class="header-content">
			<nav class="breadcrumb">
				<a href="/my-club">My Clubs</a>
				<span class="separator">›</span>
				<span>{club.name}</span>
			</nav>
			<div class="club-title-row">
				<div class="club-avatar">
					{club.name.charAt(0).toUpperCase()}
				</div>
				<div>
					<h1>{club.name}</h1>
					{#if club.location}
						<p class="club-location">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
								<circle cx="12" cy="10" r="3"/>
							</svg>
							{club.location}
						</p>
					{/if}
				</div>
			</div>
		</div>
		<div class="header-actions">
			<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
			<button class="btn btn-outline" onclick={openHelpModal}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
				Get Help
			</button>
		</div>
	</header>

	{#if club.isSuspended}
		<div class="suspension-banner">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
				<line x1="12" y1="9" x2="12" y2="13"/>
				<line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
			<div>
				<strong>This club has been suspended</strong>
				{#if club.suspensionReason}
					<p>Reason: {club.suspensionReason}</p>
				{/if}
			</div>
		</div>
	{/if}

	<div class="club-content">
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon members">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{club.members?.length || 0}</span>
					<span class="stat-label">Members</span>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon ships">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2L2 7l10 5 10-5-10-5z"/>
						<path d="M2 17l10 5 10-5"/>
						<path d="M2 12l10 5 10-5"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{club.ships?.length || 0}</span>
					<span class="stat-label">Ships</span>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon level">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{club.level || 0}</span>
					<span class="stat-label">Level</span>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon role">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value role-badge">{club.role || 'Member'}</span>
					<span class="stat-label">Your Role</span>
				</div>
			</div>
		</div>

		{#if club.joinCode}
			<div class="join-code-card">
				<div class="join-code-header">
					<h3>Invite Link</h3>
					<span class="badge">Share with members</span>
				</div>
				<div class="join-code-content">
					<code>hack.club/join/{club.joinCode}</code>
					<button class="copy-btn" onclick={() => {
						navigator.clipboard.writeText(`https://hack.club/join/${club.joinCode}`);
					}}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
						</svg>
						Copy
					</button>
				</div>
			</div>
		{/if}

		<div class="quick-links">
			<h3>Quick Actions</h3>
			<div class="links-grid">
				<a href="/my-club/{club.id}/members" class="quick-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					<span>View Members</span>
				</a>
				<a href="/my-club/{club.id}/ships" class="quick-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2L2 7l10 5 10-5-10-5z"/>
						<path d="M2 17l10 5 10-5"/>
						<path d="M2 12l10 5 10-5"/>
					</svg>
					<span>View Ships</span>
				</a>
				<a href="/my-club/{club.id}/levels" class="quick-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
					</svg>
					<span>View Levels</span>
				</a>
				{#if club.role === 'leader'}
					<a href="/my-club/{club.id}/manage" class="quick-link">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="3"/>
							<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
						</svg>
						<span>Manage Club</span>
					</a>
				{/if}
			</div>
		</div>

		{#if club.level !== undefined}
			<div class="level-section">
				<h3>Club Level Progress</h3>
				<LevelCard level={club.level} />
			</div>
		{/if}
	</div>
</div>

{#if helpModal.open}
	<Modal title="Get Help" onclose={closeHelpModal}>
		{#if helpModal.loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading ambassador info...</p>
			</div>
		{:else if helpModal.error}
			<div class="error-state">
				<p>{helpModal.error}</p>
			</div>
		{:else if helpModal.ambassador}
			<div class="ambassador-info">
				<p>Your club ambassador is here to help!</p>
				<div class="ambassador-card">
					<div class="ambassador-avatar">
						{helpModal.ambassador.name?.charAt(0) || '?'}
					</div>
					<div class="ambassador-details">
						<strong>{helpModal.ambassador.name}</strong>
						<a href="mailto:{helpModal.ambassador.email}">{helpModal.ambassador.email}</a>
					</div>
				</div>
			</div>
		{:else}
			<p>No ambassador information available.</p>
		{/if}
	</Modal>
{/if}

<style>
	.page-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		gap: 24px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #8492a6;
		margin-bottom: 12px;
	}

	.breadcrumb a {
		color: #ec3750;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.breadcrumb .separator {
		color: #c0ccda;
	}

	.club-title-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.club-avatar {
		width: 56px;
		height: 56px;
		background: #ec3750;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 700;
		color: white;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0;
	}

	.club-location {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #8492a6;
		font-size: 14px;
		margin: 4px 0 0 0;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-family: inherit;
	}

	.btn-outline {
		background: white;
		border: 2px solid #e0e6ed;
		color: #1f2d3d;
	}

	.btn-outline:hover {
		border-color: #ec3750;
		color: #ec3750;
	}

	.suspension-banner {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		background: #fff5f5;
		border: 1px solid #feb2b2;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 24px;
		color: #c53030;
	}

	.suspension-banner svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.suspension-banner strong {
		display: block;
		margin-bottom: 4px;
	}

	.suspension-banner p {
		margin: 0;
		font-size: 14px;
		opacity: 0.9;
	}

	.club-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.stat-card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon.members {
		background: rgba(51, 142, 218, 0.1);
		color: #338eda;
	}

	.stat-icon.ships {
		background: rgba(51, 214, 166, 0.1);
		color: #33d6a6;
	}

	.stat-icon.level {
		background: rgba(236, 55, 80, 0.1);
		color: #ec3750;
	}

	.stat-icon.role {
		background: rgba(132, 146, 166, 0.1);
		color: #8492a6;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: #1f2d3d;
		line-height: 1;
	}

	.stat-value.role-badge {
		font-size: 16px;
		text-transform: capitalize;
	}

	.stat-label {
		font-size: 13px;
		color: #8492a6;
		margin-top: 4px;
	}

	.join-code-card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
	}

	.join-code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.join-code-header h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0;
	}

	.badge {
		font-size: 12px;
		padding: 4px 8px;
		background: rgba(51, 214, 166, 0.1);
		color: #33d6a6;
		border-radius: 4px;
		font-weight: 600;
	}

	.join-code-content {
		display: flex;
		align-items: center;
		gap: 12px;
		background: #f9fafc;
		border-radius: 8px;
		padding: 12px 16px;
	}

	.join-code-content code {
		flex: 1;
		font-size: 16px;
		font-family: 'Phantom Sans', monospace;
		color: #ec3750;
		font-weight: 600;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
		font-family: inherit;
	}

	.copy-btn:hover {
		opacity: 0.9;
	}

	.quick-links {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
	}

	.quick-links h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 16px 0;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.quick-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: #f9fafc;
		border: 1.5px solid #e0e6ed;
		border-radius: 10px;
		color: #1f2d3d;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
	}

	.quick-link:hover {
		border-color: #ec3750;
		color: #ec3750;
		background: rgba(236, 55, 80, 0.05);
	}

	.quick-link svg {
		color: #8492a6;
	}

	.quick-link:hover svg {
		color: #ec3750;
	}

	.level-section {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
	}

	.level-section h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 16px 0;
	}

	.loading-state, .error-state {
		text-align: center;
		padding: 24px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e0e6ed;
		border-top-color: #ec3750;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 12px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.ambassador-info p {
		margin: 0 0 16px 0;
		color: #8492a6;
	}

	.ambassador-card {
		display: flex;
		align-items: center;
		gap: 12px;
		background: #f9fafc;
		border-radius: 8px;
		padding: 16px;
	}

	.ambassador-avatar {
		width: 48px;
		height: 48px;
		background: #338eda;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 700;
		color: white;
	}

	.ambassador-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.ambassador-details strong {
		color: #1f2d3d;
	}

	.ambassador-details a {
		color: #ec3750;
		font-size: 14px;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
		}

		.header-actions .btn {
			flex: 1;
			justify-content: center;
		}

		.club-title-row {
			flex-direction: column;
			align-items: flex-start;
			text-align: left;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.join-code-content {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.copy-btn {
			justify-content: center;
		}
	}
</style>
