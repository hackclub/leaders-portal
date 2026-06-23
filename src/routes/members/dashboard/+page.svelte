<script>
	import SiteNav from '$lib/SiteNav.svelte';

	let { data } = $props();

	let memberName = $derived(data.user?.firstName || data.user?.email || 'there');
	let ships = $derived(data.ships ?? []);
	let announcements = $derived(data.announcements ?? []);

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
</script>

<svelte:head>
	<title>Member Dashboard</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<section class="hero">
		<div class="hero-text">
			<h1 class="title">Welcome, {memberName}</h1>
			<p class="subtitle">This is your club member dashboard. Your club's events, ships, and announcements will show up here soon.</p>
		</div>
	</section>

	<main>
		<section class="cards">
			<div class="card">
				<h2 class="card-title">Upcoming events</h2>
				<div class="skeleton-list">
					<div class="skeleton-line"></div>
					<div class="skeleton-line short"></div>
					<div class="skeleton-line"></div>
				</div>
			</div>

			<div class="card">
				<h2 class="card-title">Your ships ({ships.length})</h2>
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
					<p class="empty-text">No ships yet. Submit your first project to see it here!</p>
				{/if}
			</div>

			<div class="card">
				<h2 class="card-title">Announcements</h2>
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
					<p class="empty-text">No announcements yet. Your club leader's announcements will show up here.</p>
				{/if}
			</div>

			<div class="card">
				<h2 class="card-title">Club info</h2>
				<div class="skeleton-list">
					<div class="skeleton-line short"></div>
					<div class="skeleton-line"></div>
				</div>
			</div>
		</section>
	</main>
</div>

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
		padding: 24px 16px 48px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.hero {
		margin-bottom: 28px;
	}

	.hero-text {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.title {
		font-size: 36px;
		font-weight: 700;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.subtitle {
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
		max-width: 52ch;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 24px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
	}

	.accent {
		display: inline-block;
		width: 4px;
		height: 22px;
		border-radius: 2px;
		background: var(--accent, #ec3750);
	}

	.card-title {
		color: var(--color-text);
		font-weight: 700;
		font-size: 22px;
		margin: 0;
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
		padding: 10px 12px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
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
		border-left: 4px solid #ec3750;
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

	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.skeleton-line {
		height: 14px;
		border-radius: 7px;
		background: var(--bg-sunken);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-line.short {
		width: 60%;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@media (max-width: 768px) {
		.title {
			font-size: 28px;
		}

		.cards {
			grid-template-columns: 1fr;
		}

		.card-title {
			font-size: 19px;
		}
	}
</style>
