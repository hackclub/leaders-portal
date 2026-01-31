<script>
	import { onMount } from 'svelte';
	import EventGrid from '$lib/EventGrid.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import { toasts } from '$lib/stores/toast.js';

	let { data } = $props();
	let events = $state([]);
	let selectedEvent = $state(null);
	let isLoading = $state(true);
	let filter = $state('upcoming');

	let filteredEvents = $derived(() => {
		const now = new Date();
		if (filter === 'upcoming') {
			return events.filter(e => e.category === 'Banner' && new Date(e.endDate || e.startDate) >= now);
		}
		if (filter === 'past') {
			return events.filter(e => e.category === 'Banner' && new Date(e.endDate || e.startDate) < now);
		}
		return events.filter(e => e.category === 'Banner');
	});

	onMount(async () => {
		await fetchEvents();
	});

	async function fetchEvents() {
		isLoading = true;
		try {
			const response = await fetch('/api/events');
			if (response.ok) {
				events = await response.json();
			} else {
				toasts.error('Failed to load events');
			}
		} catch (error) {
			console.error('Error fetching events:', error);
			toasts.error('Failed to load events');
		} finally {
			isLoading = false;
		}
	}

	function openEvent(event) {
		selectedEvent = event;
	}

	function closeModal() {
		selectedEvent = null;
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Events | Hack Club Leaders Portal</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<div class="header-content">
			<div class="header-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
					<line x1="16" y1="2" x2="16" y2="6"/>
					<line x1="8" y1="2" x2="8" y2="6"/>
					<line x1="3" y1="10" x2="21" y2="10"/>
				</svg>
			</div>
			<div>
				<h1>Hack Club Events</h1>
				<p>Hackathons, workshops, and community gatherings</p>
			</div>
		</div>
	</header>

	<div class="page-content">
		<nav class="filter-nav">
			<button 
				class="filter-btn"
				class:active={filter === 'upcoming'}
				onclick={() => filter = 'upcoming'}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<polyline points="12,6 12,12 16,14"/>
				</svg>
				<span>Upcoming</span>
			</button>
			<button 
				class="filter-btn"
				class:active={filter === 'past'}
				onclick={() => filter = 'past'}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="1,4 1,10 7,10"/>
					<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
				</svg>
				<span>Past Events</span>
			</button>
			<button 
				class="filter-btn"
				class:active={filter === 'all'}
				onclick={() => filter = 'all'}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
					<rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
				</svg>
				<span>All Events</span>
			</button>
		</nav>

		<div class="events-grid">
			{#if isLoading}
				<div class="loading">
					<div class="spinner"></div>
					<p>Loading events...</p>
				</div>
			{:else if filteredEvents().length === 0}
				<div class="empty">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
						<line x1="9" y1="16" x2="15" y2="16"/>
					</svg>
					<h3>No events found</h3>
					<p>{filter === 'upcoming' ? 'Check back soon for upcoming events!' : 'Try a different filter'}</p>
				</div>
			{:else}
				{#each filteredEvents() as event}
					<button class="event-card" onclick={() => openEvent(event)}>
						{#if event.image}
							<div class="event-image" style="background-image: url({event.image})"></div>
						{:else}
							<div class="event-image placeholder">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
							</div>
						{/if}
						<div class="event-info">
							<div class="event-date">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
								{formatDate(event.startDate)}
								{#if event.endDate && event.endDate !== event.startDate}
									- {formatDate(event.endDate)}
								{/if}
							</div>
							<h3 class="event-title">{event.name}</h3>
							{#if event.description}
								<p class="event-desc">{event.description}</p>
							{/if}
							{#if event.location}
								<div class="event-location">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
										<circle cx="12" cy="10" r="3"/>
									</svg>
									{event.location}
								</div>
							{/if}
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}

<style>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f9fafc 0%, white 100%);
	}

	.page-header {
		background: linear-gradient(135deg, #338eda 0%, #2678c4 100%);
		padding: 48px 32px;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-icon {
		width: 64px;
		height: 64px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.header-content h1 {
		margin: 0;
		font-size: 2rem;
		color: white;
	}

	.header-content p {
		margin: 6px 0 0;
		color: rgba(255, 255, 255, 0.85);
		font-size: 1.1rem;
	}

	.page-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px;
	}

	.filter-nav {
		display: flex;
		gap: 10px;
		margin-bottom: 32px;
	}

	.filter-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 100px;
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		color: #3c4858;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #338eda 0%, #2678c4 100%);
		border-color: transparent;
		color: white;
		box-shadow: 0 4px 12px rgba(51, 142, 218, 0.3);
	}

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 24px;
	}

	.event-card {
		display: flex;
		flex-direction: column;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-family: inherit;
	}

	.event-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
		border-color: #338eda;
	}

	.event-image {
		height: 180px;
		background-size: cover;
		background-position: center;
		background-color: #f0f4f8;
	}

	.event-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf0 100%);
		color: #8492a6;
	}

	.event-info {
		padding: 20px;
	}

	.event-date {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: #338eda;
		margin-bottom: 8px;
	}

	.event-title {
		margin: 0 0 8px;
		font-size: 1.25rem;
		color: #1f2d3d;
		line-height: 1.3;
	}

	.event-desc {
		margin: 0 0 12px;
		font-size: 0.9rem;
		color: #8492a6;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.event-location {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: #8492a6;
	}

	.loading, .empty {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
		text-align: center;
		color: #8492a6;
	}

	.loading .spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e0e6ed;
		border-top-color: #338eda;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty svg {
		margin-bottom: 16px;
		color: #e0e6ed;
	}

	.empty h3 {
		margin: 0 0 8px;
		color: #1f2d3d;
	}

	.empty p {
		margin: 0;
	}

	@media (max-width: 768px) {
		.page-header {
			padding: 32px 20px;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
		}

		.header-content h1 {
			font-size: 1.5rem;
		}

		.page-content {
			padding: 20px;
		}

		.filter-nav {
			flex-wrap: wrap;
			justify-content: center;
		}

		.events-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
