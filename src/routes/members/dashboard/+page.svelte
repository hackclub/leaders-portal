<script>
	import SiteNav from '$lib/SiteNav.svelte';
	import ClubCalendar from '$lib/ClubCalendar.svelte';
	import Modal from '$lib/Modal.svelte';

	let { data } = $props();

	let memberName = $derived(data.user?.firstName || data.user?.email || 'there');
	let ships = $derived(data.ships ?? []);
	let announcements = $derived(data.announcements ?? []);
	let events = $derived(data.events ?? []);
	let calendarEvents = $derived(data.calendarEvents ?? []);
	let club = $derived(data.club ?? null);

	let eventDetail = $state({ open: false, event: null });

	function openEventDetail(event) {
		eventDetail = { open: true, event };
	}

	function closeEventDetail() {
		eventDetail = { open: false, event: null };
	}

	function formatDate(value) {
		const date = new Date(value);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function formatEventDate(dateValue, timeValue) {
		// event_date may be a Date or a YYYY-MM-DD string; parse as local date
		const datePart = typeof dateValue === 'string' ? dateValue.slice(0, 10) : new Date(dateValue).toISOString().slice(0, 10);
		const [year, month, day] = datePart.split('-').map(Number);
		const date = new Date(year, (month || 1) - 1, day || 1);
		if (isNaN(date.getTime())) return '';
		const dateStr = date.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		if (timeValue) {
			const [h, m] = String(timeValue).split(':');
			const t = new Date();
			t.setHours(Number(h), Number(m), 0, 0);
			const timeStr = t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
			return `${dateStr} · ${timeStr}`;
		}
		return dateStr;
	}
</script>

<svelte:head>
	<title>Member Dashboard</title>
</svelte:head>

<SiteNav user={data.user} memberView={true} />

<div class="container">
	<header class="hero">
		<h1 class="title">Welcome, {memberName}</h1>
	</header>


	<section class="card card-full">
		<header class="card-head">
			<h2 class="card-title">Club calendar</h2>
		</header>
		<ClubCalendar
			events={calendarEvents}
			canEdit={false}
			onEventClick={(event) => openEventDetail(event)}
		/>
	</section>

	<div class="grid">
		<section class="card">
			<header class="card-head">
				<h2 class="card-title">Upcoming events</h2>
				<span class="count" style="--count-color: #338eda;">{events.length}</span>
			</header>
			{#if events.length > 0}
				<ul class="event-list">
					{#each events as event}
						<li>
							<button type="button" class="event-item" onclick={() => openEventDetail(event)}>
								<div class="event-header">
									<span class="event-title">{event.title}</span>
									<span class="event-date">{formatEventDate(event.event_date, event.event_time)}</span>
								</div>
						
								{#if event.description}
									<p class="event-description">{event.description}</p>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">
					<span class="empty-icon">📅</span>
					<p class="empty-text">No upcoming events. Your club leader's scheduled events will show up here.</p>
				</div>
			{/if}
		</section>

		<section class="card">
			<header class="card-head">
				<h2 class="card-title">Announcements</h2>
				<span class="count" style="--count-color: #ec3750;">{announcements.length}</span>
			</header>
			{#if announcements.length > 0}
				<ul class="announcement-list">
					{#each announcements as announcement}
						<li class="announcement-item">
							<p class="announcement-message">{announcement.message}</p>
							<span class="announcement-date">{formatDate(announcement.created_at)}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">
					<span class="empty-icon">📣</span>
					<p class="empty-text">No announcements yet. Your club leader's announcements will show up here.</p>
				</div>
			{/if}
		</section>

		<section class="card">
			<header class="card-head">
				<h2 class="card-title">Your ships</h2>
				<span class="count" style="--count-color: #33d6a6;">{ships.length}</span>
			</header>
			{#if ships.length > 0}
				<ul class="ship-list">
					{#each ships as ship}
						<li class="ship-item">
							<span class="ship-name">{ship.ysws}</span>
							{#if ship.codeUrl}
								<a class="ship-link" href={ship.codeUrl} target="_blank" rel="noopener noreferrer">View code →</a>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">
					<span class="empty-icon">🚀</span>
					<p class="empty-text">No ships yet. Submit your first project to see it here!</p>
				</div>
			{/if}
		</section>

		<section class="card">
			<header class="card-head">
				<h2 class="card-title">Club info</h2>
			</header>
			{#if club}
				<dl class="info-list">
					<div class="info-row">
						<dt class="info-label">Name</dt>
						<dd class="info-value">{club.name}</dd>
					</div>
					{#if club.joinCode}
						<div class="info-row">
							<dt class="info-label">Join code</dt>
							<dd class="info-value info-code">{club.joinCode}</dd>
						</div>
					{/if}
					<div class="info-row">
						<dt class="info-label">Members</dt>
						<dd class="info-value">{club.members?.length ?? 0}</dd>
					</div>
				</dl>
			{:else}
				<div class="empty">
					<span class="empty-icon">🏷️</span>
					<p class="empty-text">No club info available yet.</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<Modal open={eventDetail.open} title={eventDetail.event?.title ?? 'Event'} onClose={closeEventDetail}>
	{#if eventDetail.event}
		<div class="detail-content">
			<div class="detail-row">
				<span class="detail-label">When</span>
				<span class="detail-value">{formatEventDate(eventDetail.event.event_date, eventDetail.event.event_time)}</span>
			</div>
			{#if eventDetail.event.location}
				<div class="detail-row">
					<span class="detail-label">Where</span>
					<span class="detail-value">{eventDetail.event.location}</span>
				</div>
			{/if}
			{#if eventDetail.event.description}
				<div class="detail-block">
					<span class="detail-label">Details</span>
					<p class="detail-description">{eventDetail.event.description}</p>
				</div>
			{/if}
		</div>
	{/if}
</Modal>

<style>
	:global(body) {
		background-color: var(--bg-page);
		color: var(--color-text);
		margin: 0;
		padding: 0;
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px 56px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 28px;
	}

	.eyebrow {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		margin: 0;
	}

	.title {
		font-size: 38px;
		font-weight: 700;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
		line-height: 1.1;
	}

	.subtitle {
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
		max-width: 56ch;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 28px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 18px 20px;
	}

	.stat + .stat {
		border-left: 1px solid var(--color-border);
	}

	.stat-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--dot, #ec3750);
		flex-shrink: 0;
	}

	.stat-text {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}

	.stat-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 18px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 16px;
		padding: 24px;
	}

	.card-full {
		margin-bottom: 20px;
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 14px;
		border-bottom: 1px solid var(--color-border);
	}

	.card-title {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--color-text);
		font-weight: 700;
		font-size: 19px;
		margin: 0;
	}

	.count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 26px;
		height: 26px;
		padding: 0 8px;
		border-radius: 999px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		color: var(--count-color, var(--color-text));
		font-size: 14px;
		font-weight: 700;
		line-height: 1;
	}

	.empty {
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

	.empty-icon {
		font-size: 26px;
		line-height: 1;
	}

	.ship-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.ship-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition: border-color 0.15s, transform 0.15s;
	}

	.ship-item:hover {
		border-color: #33d6a6;
		transform: scale(1.01);
	}

	.ship-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
	}

	.ship-link {
		font-size: 14px;
		font-weight: 600;
		color: #338eda;
		text-decoration: none;
		white-space: nowrap;
	}

	.ship-link:hover {
		text-decoration: underline;
	}

	.announcement-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.announcement-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.announcement-message {
		font-size: 15px;
		color: var(--color-text);
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.announcement-date {
		font-size: 13px;
		color: var(--color-muted);
	}

	.empty-text {
		font-size: 15px;
		color: var(--color-muted);
		margin: 0;
	}

	.info-list {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--color-border);
	}

	.info-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.info-row:first-child {
		padding-top: 0;
	}

	.info-label {
		font-size: 14px;
		color: var(--color-muted);
		margin: 0;
	}

	.info-value {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
		text-align: right;
	}

	.info-code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		letter-spacing: 0.04em;
		padding: 3px 8px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 6px;
	}

	.event-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.event-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		text-align: left;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: border-color 0.15s, background-color 0.15s, transform 0.15s;
	}

	.event-item:hover {
		border-color: #338eda;
		background: light-dark(#f3f8fd, rgba(51, 142, 218, 0.18));
		transform: scale(1.01);
	}

	.detail-content {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.detail-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.detail-block {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.detail-label {
		font-size: 12px;
		font-weight: 700;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.detail-value {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
	}

	.detail-description {
		font-size: 15px;
		color: var(--color-text);
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.event-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.event-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
	}

	.event-date {
		font-size: 13px;
		font-weight: 600;
		color: #338eda;
		white-space: nowrap;
	}

	.event-location {
		font-size: 13px;
		color: var(--color-muted);
	}

	.event-description {
		font-size: 14px;
		color: var(--color-text);
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	@media (max-width: 768px) {
		.title {
			font-size: 28px;
		}

		.stats {
			grid-template-columns: 1fr 1fr;
		}

		/* Reset desktop dividers, then apply per-row/column for the 2x2 grid */
		.stat + .stat {
			border-left: none;
		}

		.stat:nth-child(even) {
			border-left: 1px solid var(--color-border);
		}

		.stat:nth-child(n + 3) {
			border-top: 1px solid var(--color-border);
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.card {
			padding: 20px;
		}

		.card-title {
			font-size: 18px;
		}
	}

	@media (max-width: 420px) {
		.stats {
			grid-template-columns: 1fr;
		}

		.stat:nth-child(even) {
			border-left: none;
		}

		.stat + .stat {
			border-top: 1px solid var(--color-border);
		}
	}
</style>
