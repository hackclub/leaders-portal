<script>
	import { onMount } from 'svelte';
	import EventGrid from '$lib/EventGrid.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import SiteNav from '$lib/SiteNav.svelte';

	import EventsView from '$lib/EventsView.svelte';
	import ToolsView from '$lib/ToolsView.svelte';

	let { data } = $props();
	let events = $state([]);
	let selectedEvent = $state(null);
	let activeTab = $state('ysws');
	let hasWebdevEvents = $derived(events.some(e => e.category === 'Webdev'));
	let hasCadEvents = $derived(events.some(e => e.category === 'CAD'));
	let hasGamedevEvents = $derived(events.some(e => e.category === 'GameDev'));
	let hasHardwareEvents = $derived(events.some(e => e.category === 'Hardware'));
	let hasOtherEvents = $derived(events.some(e => e.category === 'Other'));
	let hasCompletedEvents = $derived(events.some(e => e.completed));
	let bannerEvents = $derived(events.filter(e => e.category === 'Banner'));

	onMount(async () => {
		await fetchEvents();
	});

	async function fetchEvents() {
		try {
			const response = await fetch('/api/events');
			if (response.ok) {
				events = await response.json();
			} else {
				console.error('Failed to fetch events');
			}
		} catch (error) {
			console.error('Error fetching events:', error);
		}
	}

	function openEvent(event) {
		selectedEvent = event;
	}

	function closeModal() {
		selectedEvent = null;
	}

	async function handleComplete(eventId, markAsComplete) {
		const eventIndex = events.findIndex(e => e.id === eventId);
		if (eventIndex === -1) return;

		const originalEvent = { ...events[eventIndex] };
		
		events[eventIndex] = {
			...events[eventIndex],
			completed: markAsComplete,
			category: markAsComplete ? 'Completed' : events[eventIndex].originalCategory
		};

		try {
			const method = markAsComplete ? 'POST' : 'DELETE';
			const response = await fetch('/api/events/complete', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ eventId })
			});

			if (!response.ok) {
				console.error('Failed to update event completion status');
				events[eventIndex] = originalEvent;
			}
		} catch (error) {
			console.error('Error updating event:', error);
			events[eventIndex] = originalEvent;
		}
	}
</script>

<svelte:head>
	<title>Club Leaders Portal</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<section class="hero">
		<div class="hero-text">
			<h1 class="title">Club Leaders Portal</h1>
			<p class="subtitle">Browse workshops, track your club's progress, and find everything you need to run your Hack Club.</p>
		</div>
		<iframe
			src="https://hackclub.github.io/map?banner=small&mode={data.user ? 'manage' : 'signin'}"
			class="hero-map"
			title="Hack Club Map"
			loading="lazy"
		></iframe>
	</section>

	<div class="tab-selector">
		<button 
			class="tab-button" 
			class:active={activeTab === 'ysws'}
			onclick={() => activeTab = 'ysws'}
		>
			YSWS
		</button>
		<button 
			class="tab-button" 
			class:active={activeTab === 'events'}
			onclick={() => activeTab = 'events'}
		>
			Events
		</button>
		<button 
			class="tab-button" 
			class:active={activeTab === 'tools'}
			onclick={() => activeTab = 'tools'}
		>
			Tools
		</button>
	</div>

	<main>
		{#if activeTab === 'ysws'}
			{#if hasWebdevEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #338eda"></span>Web development series</h2>
					<EventGrid {events} category="Webdev" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}

			{#if hasCadEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #f1c40f"></span>CAD series</h2>
					<EventGrid {events} category="CAD" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}

			{#if hasGamedevEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #a633d6"></span>Game development series</h2>
					<EventGrid {events} category="GameDev" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}
			
			{#if hasHardwareEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #5bc0de"></span>Hardware series</h2>
					<EventGrid {events} category="Hardware" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}

			{#if hasOtherEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #ec3750"></span>Other clubs YSWS</h2>
					<EventGrid {events} category="Other" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}

			{#if hasCompletedEvents}
				<section class="category">
					<h2 class="section-title"><span class="accent" style="--accent: #33d6a6"></span>Completed YSWS</h2>
					<EventGrid {events} category="Completed" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
				</section>
			{/if}
		{:else if activeTab === 'events'}
			<EventsView user={data.user} {bannerEvents} />
		{:else if activeTab === 'tools'}
			<ToolsView user={data.user} />
		{/if}
	</main>

	<footer>
		<a href="https://apply.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Start a club</a>
		<a href="https://ysws.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">All YSWS Programs</a>
		<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Club Leaders Guide</a>
		<a href="https://hackclub.github.io/map" target="_blank" rel="noopener noreferrer" class="footer-link">Club Map</a>
		<a href="/posters" class="footer-link">Club Posters</a>
	</footer>
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}

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
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		align-items: center;
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
		max-width: 42ch;
	}

	.hero-map {
		width: 100%;
		height: 240px;
		border: 1px solid var(--color-border);
		border-radius: 12px;
	}

	.tab-selector {
		display: flex;
		gap: 24px;
		margin-bottom: 28px;
		border-bottom: 1px solid var(--color-border);
	}

	.tab-button {
		padding: 12px 2px;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		background: transparent;
		color: var(--color-muted);
		font-weight: 600;
		font-size: 16px;
		font-family: inherit;
		cursor: pointer;
	}

	.tab-button:hover {
		color: var(--color-text);
	}

	.tab-button.active {
		color: #ec3750;
		border-bottom-color: #ec3750;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.category {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--color-text);
		font-weight: 700;
		font-size: 22px;
		margin: 0;
	}

	.accent {
		display: inline-block;
		width: 4px;
		height: 22px;
		border-radius: 2px;
		background: var(--accent, #ec3750);
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px 24px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--color-border);
	}

	.footer-link {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-muted);
		text-decoration: none;
	}

	.footer-link:hover {
		color: #ec3750;
	}

	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.hero-map {
			height: 200px;
			order: -1;
		}

		.title {
			font-size: 28px;
		}

		.tab-button {
			font-size: 15px;
		}

		.section-title {
			font-size: 19px;
		}
	}
</style>
