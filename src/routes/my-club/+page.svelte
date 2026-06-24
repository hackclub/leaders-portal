<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import ClubCalendar from '$lib/ClubCalendar.svelte';
	import SiteNav from '$lib/SiteNav.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { onMount } from 'svelte';
	
	let { data, form } = $props();
	let clubs = $state(data.clubs);

	let isDark = $state(false);
	let iconColor = $derived(isDark ? 'white' : 'black');

	function resolveTheme() {
		const explicit = document.documentElement.getAttribute('data-theme');
		isDark = explicit
			? explicit === 'dark'
			: window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	onMount(() => {
		resolveTheme();
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', resolveTheme);
		const observer = new MutationObserver(resolveTheme);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		return () => {
			media.removeEventListener('change', resolveTheme);
			observer.disconnect();
		};
	});
	let helpModal = $state({ open: false, clubName: null, loading: false, ambassador: null, error: null });
	let transferModal = $state({ open: false, clubName: null });

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

	function openTransferModal(clubName) {
		transferModal = { open: true, clubName };
	}

	function closeTransferModal() {
		transferModal = { open: false, clubName: null };
	}

	let announceModal = $state({ open: false, clubName: null });
	let announcementMessage = $state('');
	let isSending = $state(false);

	function openAnnounceModal(clubName) {
		announcementMessage = '';
		announceModal = { open: true, clubName };
	}

	function closeAnnounceModal() {
		announceModal = { open: false, clubName: null };
	}

	let eventModal = $state({ open: false, clubName: null, mode: 'create' });
	let eventForm = $state({ id: null, title: '', eventDate: '', eventTime: '', location: '', description: '' });
	let isScheduling = $state(false);

	function openCreateEvent(clubName, dateStr = '') {
		eventForm = { id: null, title: '', eventDate: dateStr, eventTime: '', location: '', description: '' };
		eventModal = { open: true, clubName, mode: 'create' };
	}

	function openEditEvent(clubName, event) {
		eventForm = {
			id: event.id,
			title: event.title || '',
			eventDate: (event.event_date || '').slice(0, 10),
			eventTime: event.event_time || '',
			location: event.location || '',
			description: event.description || ''
		};
		eventModal = { open: true, clubName, mode: 'edit' };
	}

	function closeEventModal() {
		eventModal = { open: false, clubName: null, mode: 'create' };
		isScheduling = false;
	}
</script>

<svelte:head>
	<title>My Club - Clubs Event Portal</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<header class="page-header">
		<h1 class="page-title">My Club</h1>
		<p class="page-subtitle">Manage your clubs and track your progress.</p>
	</header>

	{#if form?.error}
		<div class="error-banner">{form.error}</div>
	{/if}

	{#if form?.success && form?.membersUpdated !== undefined}
		<div class="success-banner">Announcement sent to {form.membersUpdated} members!</div>
	{/if}

	{#if form?.success && form?.eventScheduled}
		<div class="success-banner">Event scheduled! Your members can now see it on their dashboard.</div>
	{/if}

	{#if form?.success && form?.eventUpdated}
		<div class="success-banner">Event updated!</div>
	{/if}

	{#if form?.success && form?.eventDeleted}
		<div class="success-banner">Event deleted.</div>
	{/if}

	{#if clubs.length > 0}
		<div class="clubs-grid">
			{#each clubs as club}
				<article class="club-card">
					<div class="card-top">
						<div class="club-identity">
							<h2 class="club-name">{club.name}</h2>
				
						</div>
						<div class="club-toolbar">
							<button class="toolbar-btn" onclick={() => openHelpModal(club.name)} title="Contact your ambassador">
								<img
									src="https://icons.hackclub.com/api/icons/{iconColor}/message-simple-fill"
									alt=""
									width="20"
									height="20"
								/>
								<span>Contact Us</span>
							</button>
							<RefreshButton clubName={club.name} onRefresh={(refreshedClub) => handleRefresh(club.name, refreshedClub)} />
						</div>
					</div>

					<div class="stats-grid">
						<a href="/my-club/{encodeURIComponent(club.name)}/members" class="stat-card">
							<span class="stat-number">{club.memberCount ?? club.members?.length ?? 0}</span>
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
					</div>

					{#if club.joinCode || club.clubWebsite}
						<div class="links-row">
							{#if club.joinCode}
								<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="link-card">
									<span class="link-icon">
										<img src="https://icons.hackclub.com/api/icons/{iconColor}/link" alt="" width="20" height="20" />
									</span>
									<span class="link-text">
										<span class="link-label">Invite link</span>
										<span class="link-value">hack.club/join/{club.joinCode}</span>
									</span>
								</a>
							{/if}
							{#if club.clubWebsite}
								<a href="https://hack.club/club/{getClubSlug(club.name)}" target="_blank" rel="noopener noreferrer" class="link-card">
									<span class="link-icon">
										<img src="https://icons.hackclub.com/api/icons/{iconColor}/web" alt="" width="20" height="20" />
									</span>
									<span class="link-text">
										<span class="link-label">Club website</span>
										<span class="link-value">hack.club/club/{getClubSlug(club.name)}</span>
									</span>
								</a>
							{/if}
						</div>
					{/if}

					{#if club.role === 'leader'}
						<div class="calendar-section">
							<h3 class="section-heading">Club calendar</h3>
							<ClubCalendar
								events={club.events ?? []}
								canEdit={true}
								onDayClick={(date) => openCreateEvent(club.name, date)}
								onEventClick={(event) => openEditEvent(club.name, event)}
							/>
						</div>

						<div class="actions-row">
							<a href="/my-club/{encodeURIComponent(club.name)}/manage" class="action-btn">
								<img src="https://icons.hackclub.com/api/icons/white/settings" alt="" width="20" height="20" />
								<span>Manage Club</span>
							</a>
							<button class="action-btn action-btn-secondary" onclick={() => openCreateEvent(club.name)}>
								<img src="https://icons.hackclub.com/api/icons/{iconColor}/event-add" alt="" width="20" height="20" />
								<span>Schedule Event</span>
							</button>
							<button class="action-btn action-btn-secondary" onclick={() => openAnnounceModal(club.name)}>
								<img src="https://icons.hackclub.com/api/icons/{iconColor}/message-simple-fill" alt="" width="20" height="20" />
								<span>Send Announcement</span>
							</button>
							<button class="action-btn action-btn-secondary" onclick={() => openTransferModal(club.name)}>
								<img src="https://icons.hackclub.com/api/icons/{iconColor}/external" alt="" width="20" height="20" />
								<span>Transfer Leadership</span>
							</button>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>You are not a member of any clubs yet.</p>
		</div>
	{/if}
</div>

<Modal open={helpModal.open} title="Contact Us" onClose={closeHelpModal}>
	{#if helpModal.loading}
		<p class="loading-text">Loading ambassador info...</p>
	{:else if helpModal.error}
		<p class="error-text">{helpModal.error}</p>
	{:else if helpModal.ambassador}
		<div class="ambassador-profile">
			{#if helpModal.ambassador.pfp}
				<img src={helpModal.ambassador.pfp} alt="Ambassador" class="ambassador-pfp" />
			{/if}
			{#if helpModal.ambassador.desc}
				<p class="ambassador-desc">{helpModal.ambassador.desc}</p>
			{/if}
		</div>
		<p class="help-intro">How would you like to contact your ambassador?</p>
		<div class="contact-options">
			{#if helpModal.ambassador.email}
				<a href="mailto:{helpModal.ambassador.email}" class="btn cta">
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

<Modal open={transferModal.open} title="Transfer Leadership" onClose={closeTransferModal}>
	<div class="transfer-modal-content">
		<p class="help-intro">Enter the email address of the new leader for <strong>{transferModal.clubName}</strong>.</p>
		<p class="warning-text">Warning: This action will transfer your leadership to the new user, and you will be signed out.</p>
		
		<form method="POST" action="?/changeLeader">
			<input type="hidden" name="clubName" value={transferModal.clubName} />
			<div class="form-group">
				<label for="newEmail">New Leader Email</label>
				<input type="email" id="newEmail" name="newEmail" required placeholder="leader@example.com" />
			</div>
			<div class="modal-actions">
				<button type="button" class="btn cancel-btn" onclick={closeTransferModal}>Cancel</button>
				<button type="submit" class="btn submit-btn">Transfer Leadership</button>
			</div>
		</form>
	</div>
</Modal>

<Modal open={announceModal.open} title="Send Announcement" onClose={closeAnnounceModal}>
	<div class="announce-modal-content">
		<p class="help-intro">Send an announcement to all members of <strong>{announceModal.clubName}</strong>.</p>

		<form method="POST" action="?/sendAnnouncement" onsubmit={() => (isSending = true)}>
			<input type="hidden" name="clubName" value={announceModal.clubName} />
			<div class="form-group">
				<label for="announcementMessage">Message</label>
				<textarea
					id="announcementMessage"
					name="message"
					bind:value={announcementMessage}
					placeholder="Write your announcement here..."
					rows="5"
					maxlength="1000"
					required
				></textarea>
				<div class="char-count">{announcementMessage.length}/1000</div>
			</div>
			<div class="modal-actions">
				<button type="button" class="btn cancel-btn" onclick={closeAnnounceModal}>Cancel</button>
				<button type="submit" class="btn submit-btn" disabled={isSending || !announcementMessage.trim()}>
					{isSending ? 'Sending...' : 'Send Announcement'}
				</button>
			</div>
		</form>
	</div>
</Modal>

<Modal open={eventModal.open} title={eventModal.mode === 'edit' ? 'Edit Event' : 'Schedule Event'} onClose={closeEventModal}>
	<div class="event-modal-content">
		<p class="help-intro">
			{#if eventModal.mode === 'edit'}
				Edit this event for <strong>{eventModal.clubName}</strong>. Changes appear on your members' dashboards.
			{:else}
				Schedule an event for <strong>{eventModal.clubName}</strong>. It will appear on your members' dashboards.
			{/if}
		</p>

		<form method="POST" action={eventModal.mode === 'edit' ? '?/updateEvent' : '?/scheduleEvent'} onsubmit={() => (isScheduling = true)}>
			<input type="hidden" name="clubName" value={eventModal.clubName} />
			{#if eventModal.mode === 'edit'}
				<input type="hidden" name="eventId" value={eventForm.id} />
			{/if}
			<div class="form-group">
				<label for="eventTitle">Title</label>
				<input type="text" id="eventTitle" name="title" bind:value={eventForm.title} placeholder="e.g. Weekly Hack Night" maxlength="200" required />
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for="eventDate">Date</label>
					<input type="date" id="eventDate" name="eventDate" bind:value={eventForm.eventDate} required />
				</div>
				<div class="form-group">
					<label for="eventTime">Time (optional)</label>
					<input type="time" id="eventTime" name="eventTime" bind:value={eventForm.eventTime} />
				</div>
			</div>
			<div class="form-group">
				<label for="eventLocation">Location</label>
				<input type="text" id="eventLocation" name="location" bind:value={eventForm.location} placeholder="e.g. Room 204 or a video call link" maxlength="500" required />
			</div>
			<div class="form-group">
				<label for="eventDescription">Description</label>
				<textarea
					id="eventDescription"
					name="description"
					bind:value={eventForm.description}
					placeholder="What's happening at this event?"
					rows="4"
					maxlength="2000"
					required
				></textarea>
			</div>
			<div class="modal-actions">
				<button type="button" class="btn cancel-btn" onclick={closeEventModal}>Cancel</button>
				<button type="submit" class="btn submit-btn" disabled={isScheduling}>
					{#if isScheduling}
						Saving...
					{:else if eventModal.mode === 'edit'}
						Save Changes
					{:else}
						Schedule Event
					{/if}
				</button>
			</div>
		</form>

		{#if eventModal.mode === 'edit'}
			<form method="POST" action="?/deleteEvent" class="delete-form" onsubmit={() => (isScheduling = true)}>
				<input type="hidden" name="clubName" value={eventModal.clubName} />
				<input type="hidden" name="eventId" value={eventForm.id} />
				<button type="submit" class="btn delete-btn" disabled={isScheduling}>Delete Event</button>
			</form>
		{/if}
	</div>
</Modal>



<style>
	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-title {
		font-size: 32px;
		font-weight: 700;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.page-subtitle {
		font-size: 16px;
		color: var(--color-muted);
		margin: 4px 0 0;
	}

	.clubs-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.club-card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 24px;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-wrap: wrap;
	}

	.club-identity {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.club-name {
		font-size: 24px;
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.01em;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.club-tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 600;
		text-transform: capitalize;
	}

	.tag-level {
		background-color: light-dark(#e6faf4, rgba(51, 214, 166, 0.16));
		color: light-dark(#1a7f64, #5be0b0);
	}

	.tag-role.leader {
		background-color: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
		color: #ec3750;
	}

	.tag-role.member {
		background-color: light-dark(#eaf3fc, rgba(51, 142, 218, 0.18));
		color: #338eda;
	}

	.club-toolbar {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}

	.toolbar-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.toolbar-btn:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.toolbar-btn img {
		flex-shrink: 0;
	}

	.toolbar-btn span {
		white-space: nowrap;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-top: 20px;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px 12px;
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, background-color 0.15s;
	}

	.stat-card:hover {
		border-color: #ec3750;
		background: light-dark(#fff5f7, rgba(236, 55, 80, 0.16));
	}

	.stat-number {
		font-size: 34px;
		font-weight: 700;
		color: #ec3750;
		line-height: 1;
	}

	.stat-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 8px;
	}

	.links-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-top: 16px;
	}

	.link-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		text-decoration: none;
		min-width: 0;
		transition: border-color 0.15s, background-color 0.15s;
	}

	.link-card:hover {
		border-color: #338eda;
		background: light-dark(#f3f8fd, rgba(51, 142, 218, 0.18));
	}

	.link-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 8px;
	}

	.link-card:hover .link-icon {
		border-color: #338eda;
	}

	.link-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.link-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.link-value {
		font-size: 14px;
		font-weight: 600;
		color: #338eda;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.calendar-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid var(--color-border);
	}

	.section-heading {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 12px;
	}

	.actions-row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		border: 2px solid #ec3750;
		background: #ec3750;
		color: #ffffff;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: background-color 0.15s, border-color 0.15s;
	}

	.action-btn:hover {
		background: #d63349;
		border-color: #d63349;
	}

	.action-btn img {
		flex-shrink: 0;
	}

	.action-btn-secondary {
		background: var(--bg-card);
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.action-btn-secondary:hover {
		background: var(--bg-sunken);
		border-color: var(--color-muted);
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

	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.links-row {
			grid-template-columns: 1fr;
		}

		.action-btn {
			flex: 1;
			justify-content: center;
		}
	}

	.loading-text {
		color: var(--color-muted);
		text-align: center;
		margin: 0;
	}

	.error-text {
		color: #ec3750;
		text-align: center;
		margin: 0;
	}

	.help-intro {
		color: var(--color-text);
		text-align: center;
		margin: 0 0 20px 0;
	}

	.contact-options {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.btn {
		text-align: center;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		background-color: #ec3750;
		transition: transform 0.2s, opacity 0.2s;
		color: white;
		border: none;
	}

	.contact-options .btn {
		flex: 1;
	}

	.btn:hover {
		opacity: 0.92;
	}

	.slack-button {
		background-color: #33d6a6 !important;
	}

	.ambassador-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;
	}

	.ambassador-pfp {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--color-border);
		margin-bottom: 12px;
	}

	.ambassador-desc {
		color: var(--color-text);
		text-align: center;
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.error-banner {
		background: light-dark(#fff5f7, rgba(236, 55, 80, 0.16));
		color: #ec3750;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-weight: 600;
		border: 2px solid #ec3750;
	}

	.success-banner {
		background: light-dark(#e6faf4, rgba(51, 214, 166, 0.16));
		color: light-dark(#1a7f64, #5be0b0);
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-weight: 600;
		border: 2px solid #33d6a6;
	}

	.form-group textarea {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		box-sizing: border-box;
		resize: vertical;
	}

	.form-group textarea:focus {
		outline: none;
		border-color: #338eda;
	}

	.char-count {
		font-size: 12px;
		color: var(--color-muted);
		text-align: right;
		margin-top: 6px;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.warning-text {
		color: #ec3750;
		font-size: 14px;
		margin-bottom: 16px;
		font-weight: 500;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-row {
		display: flex;
		gap: 12px;
	}

	.form-row .form-group {
		flex: 1;
	}

	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 6px;
	}

	.form-group input {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #338eda;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}

	.cancel-btn {
		background-color: var(--bg-card) !important;
		color: var(--color-text) !important;
		border: 2px solid var(--color-border) !important;
	}

	.cancel-btn:hover {
		border-color: var(--color-muted) !important;
	}

	.submit-btn {
		background-color: #ec3750 !important;
	}

	.delete-form {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--color-border);
		text-align: center;
	}

	.delete-btn {
		background-color: transparent !important;
		color: #ec3750 !important;
		border: 2px solid #ec3750 !important;
	}

	.delete-btn:hover {
		background-color: #ec3750 !important;
		color: #ffffff !important;
	}
</style>
