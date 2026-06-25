<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import ClubCalendar from '$lib/ClubCalendar.svelte';
	import ClubChat from '$lib/ClubChat.svelte';
	import SiteNav from '$lib/SiteNav.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { onMount } from 'svelte';
	
	let { data, form } = $props();
	let clubs = $state(data.clubs);

	// Keep the local clubs state in sync with fresh load data (e.g. after a
	// chat message is sent or deleted and the form action invalidates the page).
	$effect(() => {
		clubs = data.clubs;
	});

	let isDark = $state(false);
	let iconColor = $derived(isDark ? 'white' : 'black');

	// Track whether each club's chat is expanded. Non-leaders have no toggle
	// button, so their chat is shown by default.
	let chatExpanded = $state(
		Object.fromEntries(data.clubs.map((club) => [club.name, club.role !== 'leader']))
	);

	function isToday(value) {
		const date = new Date(value);
		if (isNaN(date.getTime())) return false;
		const now = new Date();
		return (
			date.getFullYear() === now.getFullYear() &&
			date.getMonth() === now.getMonth() &&
			date.getDate() === now.getDate()
		);
	}

	function todayMessageCount(messages) {
		return (messages ?? []).filter((msg) => isToday(msg.created_at)).length;
	}

	function formatChatDate(value) {
		const date = new Date(value);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}

	// Inbox: today's chat messages across all clubs, excluding messages the
	// leader sent themselves (their own leader-authored messages).
	let inboxOpen = $state(false);

	let inboxClubs = $derived(
		clubs
			.map((club) => ({
				name: club.name,
				messages: (club.chatMessages ?? []).filter(
					(m) =>
						isToday(m.created_at) &&
						!(m.is_leader === true && m.sender_email === data.effectiveEmail)
				)
			}))
			.filter((c) => c.messages.length > 0)
	);

	let notificationCount = $derived(
		inboxClubs.reduce((total, c) => total + c.messages.length, 0)
	);

	function openInbox() {
		inboxOpen = true;
	}

	function closeInbox() {
		inboxOpen = false;
	}

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
	let eventForm = $state({ id: null, title: '', eventDate: '', eventTime: '', location: '', description: '', rsvps: [] });
	let isScheduling = $state(false);

	function openCreateEvent(clubName, dateStr = '') {
		eventForm = { id: null, title: '', eventDate: dateStr, eventTime: '', location: '', description: '', rsvps: [] };
		eventModal = { open: true, clubName, mode: 'create' };
	}

	function openEditEvent(clubName, event) {
		eventForm = {
			id: event.id,
			title: event.title || '',
			eventDate: (event.event_date || '').slice(0, 10),
			eventTime: event.event_time || '',
			location: event.location || '',
			description: event.description || '',
			rsvps: event.rsvps || []
		};
		eventModal = { open: true, clubName, mode: 'edit' };
	}

	let goingRsvps = $derived((eventForm.rsvps || []).filter((r) => r.status === 'going'));
	let notGoingRsvps = $derived((eventForm.rsvps || []).filter((r) => r.status === 'not_going'));

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
		<div class="page-header-text">
			<h1 class="page-title">My Club</h1>
			<p class="page-subtitle">Manage your clubs and track your progress.</p>
		</div>
		<button
			type="button"
			class="inbox-btn"
			onclick={openInbox}
			aria-label="Open inbox ({notificationCount} notifications)"
		>
			<svg
				class="inbox-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="26"
				height="26"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M22 12h-6l-2 3h-4l-2-3H2" />
				<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
			</svg>
			{#if notificationCount > 0}
				<span class="inbox-badge">{notificationCount}</span>
			{/if}
		</button>
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
								<span>	adership</span>
							</button>
							<button class="action-btn action-btn-secondary" onclick={() => (chatExpanded[club.name] = !chatExpanded[club.name])}>
								<img src="https://icons.hackclub.com/api/icons/{iconColor}/message-simple-fill" alt="" width="20" height="20" />
								<span>{chatExpanded[club.name] ? 'Hide Chat' : 'Open Chat'}</span>
								{#if todayMessageCount(club.chatMessages) > 0}
									<span class="chat-count-badge">{todayMessageCount(club.chatMessages)}</span>
								{/if}
							</button>
						</div>
					{/if}

					<div class="chat-section">
						<ClubChat
							clubName={club.name}
							messages={club.chatMessages ?? []}
							canDelete={club.role === 'leader'}
							currentEmail={data.effectiveEmail}
							bind:expanded={chatExpanded[club.name]}
						/>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>You are not a member of any clubs yet.</p>
		</div>
	{/if}
</div>

<Modal open={inboxOpen} title="Inbox" onClose={closeInbox} maxWidth="520px">
	{#if notificationCount === 0}
		<div class="inbox-empty">
			<span class="inbox-empty-icon">📭</span>
			<p class="inbox-empty-text">You're all caught up! No new chat messages today.</p>
		</div>
	{:else}
		<div class="inbox-content">
			{#each inboxClubs as club}
				<div class="inbox-group">
					<h3 class="inbox-group-title">
						<span class="inbox-group-dot"></span>
						{club.name}
						<span class="inbox-group-count">{club.messages.length}</span>
					</h3>
					<ul class="inbox-list">
						{#each club.messages as message}
							<li class="inbox-item">
								<span class="inbox-item-title">
									{message.sender_name}{#if message.is_leader}<span class="inbox-leader-tag">Leader</span>{/if}
								</span>
								<p class="inbox-item-message">{message.message}</p>
								<span class="inbox-item-meta">{formatChatDate(message.created_at)}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}
</Modal>

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

<Modal open={eventModal.open} title={eventModal.mode === 'edit' ? 'Edit Event' : 'Schedule Event'} maxWidth={eventModal.mode === 'edit' ? '720px' : '400px'} onClose={closeEventModal}>
	<div class="event-modal-content">
		<p class="help-intro">
			{#if eventModal.mode === 'edit'}
				Edit this event for <strong>{eventModal.clubName}</strong>. Changes appear on your members' dashboards.
			{:else}
				Schedule an event for <strong>{eventModal.clubName}</strong>. It will appear on your members' dashboards.
			{/if}
		</p>

		<div class="event-edit-layout" class:has-rsvps={eventModal.mode === 'edit'}>
			<form class="event-form" method="POST" action={eventModal.mode === 'edit' ? '?/updateEvent' : '?/scheduleEvent'} onsubmit={() => (isScheduling = true)}>
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
					{#if eventModal.mode === 'edit'}
						<button type="submit" formaction="?/deleteEvent" formnovalidate class="btn delete-btn" disabled={isScheduling}>Delete Event</button>
					{/if}
				</div>
			</form>

			{#if eventModal.mode === 'edit'}
				<div class="rsvp-section">
					<h3 class="rsvp-heading">
						RSVPs
						<span class="rsvp-summary">{goingRsvps.length} going · {notGoingRsvps.length} can't make it</span>
					</h3>

					{#if eventForm.rsvps.length === 0}
						<p class="rsvp-empty">No RSVPs yet. Member responses will appear here.</p>
					{:else}
						{#if goingRsvps.length > 0}
							<div class="rsvp-group">
								<span class="rsvp-group-label going">Going ({goingRsvps.length})</span>
								<ul class="rsvp-people">
									{#each goingRsvps as person}
										<li class="rsvp-person">{person.member_name || person.member_email}</li>
									{/each}
								</ul>
							</div>
						{/if}
						{#if notGoingRsvps.length > 0}
							<div class="rsvp-group">
								<span class="rsvp-group-label not-going">Can't make it ({notGoingRsvps.length})</span>
								<ul class="rsvp-people">
									{#each notGoingRsvps as person}
										<li class="rsvp-person">{person.member_name || person.member_email}</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
	}

	.inbox-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, transform 0.15s;
	}

	.inbox-btn:hover {
		border-color: #ec3750;
		color: #ec3750;
		transform: scale(1.04);
	}

	.inbox-icon {
		display: block;
	}

	.inbox-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		border-radius: 999px;
		background: #ec3750;
		border: 2px solid var(--bg-page);
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
	}

	.inbox-content {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	.inbox-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.inbox-group-title {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-muted);
	}

	.inbox-group-dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #33d6a6;
		flex-shrink: 0;
	}

	.inbox-group-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 999px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		font-size: 12px;
		font-weight: 700;
	}

	.inbox-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.inbox-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.inbox-item-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		color: var(--color-text);
	}

	.inbox-leader-tag {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #ec3750;
		background: light-dark(#fff0f3, rgba(236, 55, 80, 0.16));
		border: 1px solid #ec3750;
		border-radius: 999px;
		padding: 1px 7px;
	}

	.inbox-item-message {
		font-size: 14px;
		color: var(--color-text);
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.inbox-item-meta {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
	}

	.inbox-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 8px;
		padding: 24px 16px;
		background: var(--bg-sunken);
		border: 1px dashed var(--color-border);
		border-radius: 10px;
	}

	.inbox-empty-icon {
		font-size: 26px;
		line-height: 1;
	}

	.inbox-empty-text {
		font-size: 15px;
		color: var(--color-muted);
		margin: 0;
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

	.chat-section {
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

	.chat-count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: #ec3750;
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		border-radius: 999px;
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

	.event-edit-layout {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	.event-edit-layout .event-form {
		flex: 1 1 0;
		min-width: 0;
	}

	.rsvp-section {
		flex: 0 0 240px;
		align-self: stretch;
		padding-left: 24px;
		border-left: 1px solid var(--color-border);
	}

	@media (max-width: 640px) {
		.event-edit-layout {
			flex-direction: column;
			gap: 16px;
		}

		.rsvp-section {
			flex-basis: auto;
			width: 100%;
			padding-left: 0;
			padding-top: 16px;
			border-left: none;
			border-top: 1px solid var(--color-border);
		}
	}

	.rsvp-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 12px;
	}

	.rsvp-summary {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
	}

	.rsvp-empty {
		font-size: 14px;
		color: var(--color-muted);
		margin: 0;
	}

	.rsvp-group {
		margin-bottom: 12px;
	}

	.rsvp-group:last-child {
		margin-bottom: 0;
	}

	.rsvp-group-label {
		display: inline-block;
		font-size: 13px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.rsvp-group-label.going {
		color: #1f9e7a;
	}

	.rsvp-group-label.not-going {
		color: #ec3750;
	}

	.rsvp-people {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.rsvp-person {
		padding: 4px 10px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
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
