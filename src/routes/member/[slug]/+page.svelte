<script>
	import ConfirmModal from '$lib/ConfirmModal.svelte';
	
	let { data } = $props();
	
	let activeTab = $state('announcements');
	let showLeaveConfirm = $state(false);
	let leaveFormRef = $state(null);
	
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
	
	function formatTime(timeStr) {
		if (!timeStr) return null;
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	}
	
	function formatRelativeDate(dateStr) {
		const date = new Date(dateStr);
		const now = new Date();
		const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
	
	function handleLeaveConfirm() {
		if (leaveFormRef) {
			leaveFormRef.submit();
		}
		showLeaveConfirm = false;
	}
</script>

<svelte:head>
	<title>{data.club.name} - Member Dashboard</title>
</svelte:head>

<div class="club-member-page">
	<header class="page-header">
		<a href="/member" class="back-link">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"/>
			</svg>
			Back to Dashboard
		</a>
		
		<div class="club-header">
			<div class="club-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
					<polyline points="9 22 9 12 15 12 15 22"/>
				</svg>
			</div>
			<div class="club-info">
				<h1>{data.club.name}</h1>
				{#if data.club.location}
					<p class="club-location">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
							<circle cx="12" cy="10" r="3"/>
						</svg>
						{data.club.location}
					</p>
				{/if}
			</div>
		</div>
	</header>

	<nav class="tabs">
		<button 
			class="tab" 
			class:active={activeTab === 'announcements'}
			onclick={() => activeTab = 'announcements'}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
				<path d="M9.5 21a1.5 1.5 0 0 0 3 0"/>
			</svg>
			Announcements
			{#if data.announcements.length > 0}
				<span class="badge">{data.announcements.length}</span>
			{/if}
		</button>
		<button 
			class="tab" 
			class:active={activeTab === 'events'}
			onclick={() => activeTab = 'events'}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
				<line x1="16" y1="2" x2="16" y2="6"/>
				<line x1="8" y1="2" x2="8" y2="6"/>
				<line x1="3" y1="10" x2="21" y2="10"/>
			</svg>
			Events
			{#if data.upcomingEvents.length > 0}
				<span class="badge">{data.upcomingEvents.length}</span>
			{/if}
		</button>
		<button 
			class="tab" 
			class:active={activeTab === 'settings'}
			onclick={() => activeTab = 'settings'}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"/>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
			</svg>
			Settings
		</button>
	</nav>

	<main class="content">
		{#if activeTab === 'announcements'}
			<div class="announcements-tab">
				{#if data.announcements.length === 0}
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
							<path d="M9.5 21a1.5 1.5 0 0 0 3 0"/>
						</svg>
						<h3>No announcements yet</h3>
						<p>Club leaders haven't posted any announcements.</p>
					</div>
				{:else}
					<div class="announcements-list">
						{#each data.announcements as announcement}
							<article class="announcement-card">
								<div class="announcement-header">
									<h3>{announcement.subject}</h3>
									<time datetime={announcement.createdAt}>
										{new Date(announcement.createdAt).toLocaleDateString('en-US', { 
											month: 'short', 
											day: 'numeric',
											year: 'numeric'
										})}
									</time>
								</div>
								<p class="announcement-message">{announcement.message}</p>
							</article>
						{/each}
					</div>
				{/if}
			</div>
		{:else if activeTab === 'events'}
			<div class="events-tab">
				{#if data.upcomingEvents.length === 0 && data.pastEvents.length === 0}
					<div class="empty-state">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
						<h3>No events scheduled</h3>
						<p>Check back later for upcoming events.</p>
					</div>
				{:else}
					{#if data.upcomingEvents.length > 0}
						<h2 class="section-title">Upcoming Events</h2>
						<div class="events-list">
							{#each data.upcomingEvents as event}
								<article class="event-card">
									<div class="event-date-badge">
										<span class="day">{new Date(event.date).getDate()}</span>
										<span class="month">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
									</div>
									<div class="event-details">
										<h3>{event.title}</h3>
										<div class="event-meta">
											<span class="event-when">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<circle cx="12" cy="12" r="10"/>
													<polyline points="12 6 12 12 16 14"/>
												</svg>
												{formatRelativeDate(event.date)}{event.time ? ` at ${formatTime(event.time)}` : ''}
											</span>
											{#if event.location}
												<span class="event-where">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
														<circle cx="12" cy="10" r="3"/>
													</svg>
													{event.location}
												</span>
											{/if}
										</div>
										{#if event.description}
											<p class="event-description">{event.description}</p>
										{/if}
									</div>
								</article>
							{/each}
						</div>
					{/if}
					
					{#if data.pastEvents.length > 0}
						<h2 class="section-title past">Past Events</h2>
						<div class="past-events-list">
							{#each data.pastEvents as event}
								<div class="past-event">
									<span class="past-event-title">{event.title}</span>
									<span class="past-event-date">{formatDate(event.date)}</span>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		{:else if activeTab === 'settings'}
			<div class="settings-tab">
				<div class="settings-section">
					<h2>Membership</h2>
					<p class="joined-info">
						You joined this club on {formatDate(data.club.joinedAt)}.
					</p>
					
					<div class="danger-zone">
						<h3>Leave Club</h3>
						<p>If you leave this club, you'll no longer receive announcements or see events. You can rejoin later if the club accepts new members.</p>
						<form bind:this={leaveFormRef} method="POST" action="?/leave" style="display: none;"></form>
						<button type="button" class="btn btn-danger" onclick={() => showLeaveConfirm = true}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
								<polyline points="16 17 21 12 16 7"/>
								<line x1="21" y1="12" x2="9" y2="12"/>
							</svg>
							Leave Club
						</button>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<ConfirmModal
	open={showLeaveConfirm}
	title="Leave Club"
	message={`Are you sure you want to leave ${data.club.name}? You can rejoin later with a new invite link.`}
	confirmText="Leave Club"
	cancelText="Cancel"
	variant="danger"
	onConfirm={handleLeaveConfirm}
	onCancel={() => showLeaveConfirm = false}
/>

<style>
	.club-member-page {
		width: 100%;
		min-height: 100%;
		padding: 32px;
	}

	.page-header {
		margin-bottom: 32px;
		padding-bottom: 24px;
		border-bottom: 1px solid #e0e6ed;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #8492a6;
		text-decoration: none;
		font-size: 0.9rem;
		margin-bottom: 20px;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.club-header {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.club-icon {
		width: 56px;
		height: 56px;
		background: #ec3750;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.club-info h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 4px 0;
	}

	.club-location {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #8492a6;
		font-size: 0.9rem;
		margin: 0;
	}

	.tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid #e0e6ed;
		margin-bottom: 24px;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background: none;
		border: none;
		color: #8492a6;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		position: relative;
		transition: color 0.2s;
	}

	.tab:hover {
		color: #1f2d3d;
	}

	.tab.active {
		color: #ec3750;
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 2px;
		background: #ec3750;
	}

	.tab .badge {
		background: #ec3750;
		color: white;
		font-size: 0.75rem;
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 64px 24px;
		background: #f9fafb;
		border-radius: 16px;
		border: 1px solid #e0e6ed;
	}

	.empty-state svg {
		color: #c0ccda;
		margin-bottom: 16px;
		display: block;
	}

	.empty-state h3 {
		color: #1f2d3d;
		margin: 0 0 8px 0;
		font-size: 1.1rem;
	}

	.empty-state p {
		margin: 0;
		color: #8492a6;
	}

	.announcements-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.announcement-card {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
	}

	.announcement-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 12px;
	}

	.announcement-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0;
	}

	.announcement-header time {
		color: #8492a6;
		font-size: 0.85rem;
		white-space: nowrap;
	}

	.announcement-message {
		color: #5a6b7e;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #8492a6;
		margin: 0 0 16px 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section-title.past {
		margin-top: 32px;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.event-card {
		display: flex;
		gap: 16px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		padding: 20px;
	}

	.event-date-badge {
		width: 56px;
		height: 56px;
		background: #ec3750;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.event-date-badge .day {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
	}

	.event-date-badge .month {
		font-size: 0.7rem;
		text-transform: uppercase;
		font-weight: 500;
	}

	.event-details {
		flex: 1;
	}

	.event-details h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.event-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 8px;
	}

	.event-meta span {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #8492a6;
		font-size: 0.9rem;
	}

	.event-description {
		color: #5a6b7e;
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 8px 0 0 0;
	}

	.past-events-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.past-event {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e0e6ed;
	}

	.past-event-title {
		color: #5a6b7e;
	}

	.past-event-date {
		color: #8492a6;
		font-size: 0.85rem;
	}

	.settings-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 12px 0;
	}

	.joined-info {
		color: #8492a6;
		margin: 0 0 32px 0;
	}

	.danger-zone {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 12px;
		padding: 20px;
	}

	.danger-zone h3 {
		color: #dc2626;
		font-size: 1rem;
		margin: 0 0 8px 0;
	}

	.danger-zone p {
		color: #7f1d1d;
		font-size: 0.9rem;
		margin: 0 0 16px 0;
		line-height: 1.5;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.9rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-danger {
		background: #dc2626;
		color: white;
	}

	.btn-danger:hover {
		background: #b91c1c;
	}

	/* Dark mode */
	:global(.dark) .page-header {
		border-bottom-color: #333;
	}

	:global(.dark) .club-info h1 {
		color: #f0f0f0;
	}

	:global(.dark) .club-location {
		color: #888;
	}

	:global(.dark) .back-link {
		color: #888;
	}

	:global(.dark) .tabs {
		border-color: #333;
	}

	:global(.dark) .tab {
		color: #888;
	}

	:global(.dark) .tab:hover {
		color: #ccc;
	}

	:global(.dark) .empty-state {
		background: #1e1e2e;
		border-color: #333;
	}

	:global(.dark) .empty-state svg {
		color: #555;
	}

	:global(.dark) .empty-state h3 {
		color: #f0f0f0;
	}

	:global(.dark) .empty-state p {
		color: #888;
	}

	:global(.dark) .announcement-card,
	:global(.dark) .event-card {
		background: #1e1e2e;
		border-color: #333;
	}

	:global(.dark) .announcement-header h3,
	:global(.dark) .event-details h3 {
		color: #f0f0f0;
	}

	:global(.dark) .announcement-message,
	:global(.dark) .event-description {
		color: #bbb;
	}

	:global(.dark) .section-title {
		color: #888;
	}

	:global(.dark) .event-meta span {
		color: #888;
	}

	:global(.dark) .past-event {
		background: #1e1e2e;
		border-color: #333;
	}

	:global(.dark) .past-event-title {
		color: #aaa;
	}

	:global(.dark) .settings-section h2 {
		color: #f0f0f0;
	}

	:global(.dark) .joined-info {
		color: #888;
	}

	:global(.dark) .danger-zone {
		background: rgba(220, 38, 38, 0.1);
		border-color: rgba(220, 38, 38, 0.3);
	}

	:global(.dark) .danger-zone p {
		color: #f87171;
	}

	@media (max-width: 768px) {
		.club-member-page {
			padding: 20px;
		}

		.club-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.tabs {
			overflow-x: auto;
		}

		.tab {
			padding: 10px 12px;
			font-size: 0.9rem;
		}

		.event-card {
			flex-direction: column;
		}

		.event-date-badge {
			width: 100%;
			height: auto;
			flex-direction: row;
			gap: 8px;
			padding: 12px;
		}

		.event-date-badge .day {
			font-size: 1.1rem;
		}
	}
</style>
