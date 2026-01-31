<script>
	import { onMount } from 'svelte';
	import EventModal from '$lib/EventModal.svelte';
	import { toasts } from '$lib/stores/toast.js';

	let { data } = $props();
	let events = $state([]);
	let selectedEvent = $state(null);
	let isLoading = $state(true);
	let activeCategory = $state('all');
	let viewMode = $state('grid'); // 'grid' or 'list'

	const categories = [
		{ id: 'all', label: 'All Programs', color: '#ec3750' },
		{ id: 'Webdev', label: 'Web Dev', color: '#338eda' },
		{ id: 'CAD', label: 'CAD & Design', color: '#a855f7' },
		{ id: 'GameDev', label: 'Game Dev', color: '#f59e0b' },
		{ id: 'Hardware', label: 'Hardware', color: '#10b981' },
		{ id: 'Other', label: 'Other', color: '#8b5cf6' },
		{ id: 'Completed', label: 'Completed', color: '#33d6a6' }
	];

	let filteredEvents = $derived.by(() => {
		if (activeCategory === 'all') {
			return events.filter(e => e.category !== 'Banner' && e.category !== 'Completed');
		}
		if (activeCategory === 'Completed') {
			return events.filter(e => e.completed);
		}
		return events.filter(e => e.category === activeCategory);
	});

	let categoryCounts = $derived.by(() => {
		return {
			all: events.filter(e => e.category !== 'Banner' && !e.completed).length,
			Webdev: events.filter(e => e.category === 'Webdev').length,
			CAD: events.filter(e => e.category === 'CAD').length,
			GameDev: events.filter(e => e.category === 'GameDev').length,
			Hardware: events.filter(e => e.category === 'Hardware').length,
			Other: events.filter(e => e.category === 'Other').length,
			Completed: events.filter(e => e.completed).length
		};
	});

	let activeColor = $derived(categories.find(c => c.id === activeCategory)?.color || '#ec3750');

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
				toasts.error('Failed to load programs');
			}
		} catch (error) {
			console.error('Error fetching events:', error);
			toasts.error('Failed to load programs');
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

	async function handleComplete(event, e) {
		e.stopPropagation();
		const eventIndex = events.findIndex(ev => ev.id === event.id);
		if (eventIndex === -1) return;

		const originalEvent = { ...events[eventIndex] };
		const markAsComplete = !event.completed;
		
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
				body: JSON.stringify({ eventId: event.id })
			});

			if (!response.ok) {
				events[eventIndex] = originalEvent;
				toasts.error('Failed to update program status');
			} else {
				toasts.success(markAsComplete ? 'Marked as complete!' : 'Marked as incomplete');
			}
		} catch (error) {
			events[eventIndex] = originalEvent;
			toasts.error('Failed to update program status');
		}
	}
</script>

<svelte:head>
	<title>YSWS Programs | Leaders Portal</title>
</svelte:head>

<div class="page">
	<!-- Hero Section -->
	<header class="hero">
		<div class="hero-content">
			<div class="hero-badge">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
					<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
				</svg>
				YSWS Programs
			</div>
			<h1>You Ship, We Ship</h1>
			<p class="hero-subtitle">Build awesome projects and earn free hardware, domains, and swag from Hack Club!</p>
			
			<div class="hero-stats">
				<div class="stat">
					<span class="stat-value">{categoryCounts.all}</span>
					<span class="stat-label">Active Programs</span>
				</div>
				<div class="stat">
					<span class="stat-value">{categoryCounts.Completed}</span>
					<span class="stat-label">Completed</span>
				</div>
			</div>
		</div>
		<div class="hero-decoration">
			<svg viewBox="0 0 200 200" class="decoration-svg">
				<circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
				<circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
				<circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
			</svg>
		</div>
	</header>

	<div class="content">
		<!-- Controls -->
		<div class="controls">
			<nav class="category-pills">
				{#each categories as cat}
					{@const count = categoryCounts[cat.id]}
					{#if count > 0 || cat.id === 'all'}
						<button 
							class="pill"
							class:active={activeCategory === cat.id}
							style="--pill-color: {cat.color}"
							onclick={() => activeCategory = cat.id}
						>
							<span class="pill-label">{cat.label}</span>
							<span class="pill-count">{count}</span>
						</button>
					{/if}
				{/each}
			</nav>
			
			<div class="view-toggle">
				<button 
					class="toggle-btn" 
					class:active={viewMode === 'grid'}
					onclick={() => viewMode = 'grid'}
					title="Grid view"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
						<rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
					</svg>
				</button>
				<button 
					class="toggle-btn" 
					class:active={viewMode === 'list'}
					onclick={() => viewMode = 'list'}
					title="List view"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
						<line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
						<line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Programs Display -->
		{#if isLoading}
			<div class="loading-state">
				<div class="loader"></div>
				<p>Loading programs...</p>
			</div>
		{:else if filteredEvents.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
						<polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
					</svg>
				</div>
				<h3>No programs found</h3>
				<p>Try selecting a different category</p>
			</div>
		{:else}
			{#if viewMode === 'grid'}
				<div class="programs-grid">
					{#each filteredEvents as event}
						<button 
							class="program-card"
							style="--card-bg: {event.color}; --card-text: {event.textColor}; {event.backgroundUrl ? `background-image: url('${event.backgroundUrl}'); background-size: cover;` : ''}"
							onclick={() => openEvent(event)}
						>
							{#if event.backgroundUrl}
								<div class="card-overlay"></div>
							{/if}
							
							{#if data.user}
								<button 
									class="complete-btn"
									class:completed={event.completed}
									onclick={(e) => handleComplete(event, e)}
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								</button>
							{/if}
							
							<div class="card-content">
								<img src={event.icon} alt="" class="program-icon" />
								<h3>{event.title}</h3>
								<div class="program-meta">
									<span class="program-type" style="background: {event.buttonColor}; color: {event.buttonTextColor}">
										{event.type}
									</span>
									<span class="program-time">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
											<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
										</svg>
										{event.et}
									</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="programs-list">
					{#each filteredEvents as event}
						<button 
							class="program-row"
							onclick={() => openEvent(event)}
						>
							<div class="row-icon" style="background: {event.color}">
								<img src={event.icon} alt="" />
							</div>
							
							<div class="row-content">
								<h3>{event.title}</h3>
								<p class="row-description">{event.description?.slice(0, 100)}{event.description?.length > 100 ? '...' : ''}</p>
							</div>
							
							<div class="row-meta">
								<span class="row-type" style="background: {event.buttonColor}; color: {event.buttonTextColor}">
									{event.type}
								</span>
								<span class="row-time">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
									</svg>
									{event.et}
								</span>
							</div>
							
							{#if data.user}
								<button 
									class="row-complete"
									class:completed={event.completed}
									onclick={(e) => handleComplete(event, e)}
								>
									{#if event.completed}
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
										Done
									{:else}
										Mark Complete
									{/if}
								</button>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
		
		<!-- Info Section -->
		<section class="info-section">
			<h2>How it works</h2>
			<div class="info-grid">
				<div class="info-card">
					<div class="info-icon" style="background: linear-gradient(135deg, #338eda, #5ba3e6)">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
						</svg>
					</div>
					<h3>1. Pick a program</h3>
					<p>Choose from web dev, hardware, design, game dev, and more</p>
				</div>
				<div class="info-card">
					<div class="info-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
						</svg>
					</div>
					<h3>2. Build & ship</h3>
					<p>Create your project and submit it to the program</p>
				</div>
				<div class="info-card">
					<div class="info-icon" style="background: linear-gradient(135deg, #33d6a6, #5de0b8)">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
							<polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
						</svg>
					</div>
					<h3>3. Get rewarded</h3>
					<p>Receive free hardware, domains, or swag in the mail!</p>
				</div>
			</div>
		</section>
	</div>
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}

<style>
	.page {
		min-height: 100vh;
		background: #f9fafc;
	}

	/* Hero Section */
	.hero {
		background: linear-gradient(135deg, #ec3750 0%, #d12d42 100%);
		padding: 48px 32px 56px;
		position: relative;
		overflow: hidden;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		padding: 8px 16px;
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 20px;
	}

	.hero h1 {
		font-size: 2.5rem;
		font-weight: 800;
		color: #fff;
		margin: 0 0 12px 0;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: 1.15rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 28px 0;
		max-width: 500px;
		line-height: 1.5;
	}

	.hero-stats {
		display: flex;
		gap: 32px;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: #fff;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 4px;
	}

	.hero-decoration {
		position: absolute;
		right: -50px;
		top: 50%;
		transform: translateY(-50%);
		width: 300px;
		height: 300px;
		opacity: 0.5;
	}

	.decoration-svg {
		width: 100%;
		height: 100%;
		animation: rotate 30s linear infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Content */
	.content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px;
	}

	/* Controls */
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 20px;
		margin-bottom: 28px;
		flex-wrap: wrap;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: #fff;
		border: 2px solid #e0e6ed;
		border-radius: 100px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.15s;
	}

	.pill:hover {
		border-color: var(--pill-color);
		color: var(--pill-color);
	}

	.pill.active {
		background: var(--pill-color);
		border-color: var(--pill-color);
		color: #fff;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--pill-color) 30%, transparent);
	}

	.pill-count {
		padding: 2px 8px;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 100px;
		font-size: 0.75rem;
	}

	.pill.active .pill-count {
		background: rgba(255, 255, 255, 0.25);
	}

	.view-toggle {
		display: flex;
		background: #fff;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		overflow: hidden;
	}

	.toggle-btn {
		padding: 10px 14px;
		background: none;
		border: none;
		color: #8492a6;
		cursor: pointer;
		transition: all 0.15s;
	}

	.toggle-btn:hover {
		color: #1f2d3d;
	}

	.toggle-btn.active {
		background: #ec3750;
		color: #fff;
	}

	/* Loading & Empty States */
	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
		text-align: center;
	}

	.loader {
		width: 48px;
		height: 48px;
		border: 4px solid #e0e6ed;
		border-top-color: #ec3750;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p, .empty-state p {
		color: #8492a6;
		margin: 0;
	}

	.empty-icon {
		color: #d0d6dd;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	/* Grid View */
	.programs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 20px;
	}

	.program-card {
		background: var(--card-bg);
		border-radius: 16px;
		padding: 20px;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		border: none;
		text-align: center;
		transition: all 0.2s;
	}

	.program-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
		pointer-events: none;
	}

	.complete-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 32px;
		height: 32px;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		color: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
		z-index: 2;
	}

	.complete-btn:hover {
		background: rgba(255, 255, 255, 0.4);
		border-color: #fff;
		transform: scale(1.1);
	}

	.complete-btn.completed {
		background: #33d6a6;
		border-color: #33d6a6;
		color: #fff;
	}

	.card-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 10px;
	}

	.program-icon {
		width: 56px;
		height: 56px;
		object-fit: contain;
	}

	.program-card h3 {
		color: var(--card-text);
		font-size: 1rem;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
	}

	.program-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.program-type {
		padding: 4px 10px;
		border-radius: 100px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.program-time {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--card-text);
		opacity: 0.85;
	}

	/* List View */
	.programs-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.program-row {
		display: flex;
		align-items: center;
		gap: 16px;
		background: #fff;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 16px 20px;
		cursor: pointer;
		transition: all 0.15s;
		text-align: left;
	}

	.program-row:hover {
		border-color: #d0d6dd;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.row-icon {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.row-icon img {
		width: 36px;
		height: 36px;
		object-fit: contain;
	}

	.row-content {
		flex: 1;
		min-width: 0;
	}

	.row-content h3 {
		font-size: 1rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 4px 0;
	}

	.row-description {
		font-size: 0.85rem;
		color: #8492a6;
		margin: 0;
		line-height: 1.4;
	}

	.row-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
	}

	.row-type {
		padding: 4px 10px;
		border-radius: 100px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.row-time {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8rem;
		color: #8492a6;
	}

	.row-complete {
		padding: 8px 16px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.row-complete:hover {
		border-color: #33d6a6;
		color: #33d6a6;
	}

	.row-complete.completed {
		background: #33d6a6;
		border-color: #33d6a6;
		color: #fff;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* Info Section */
	.info-section {
		margin-top: 48px;
		padding-top: 40px;
		border-top: 2px solid #e0e6ed;
	}

	.info-section h2 {
		font-size: 1.3rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 24px 0;
		text-align: center;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px;
	}

	.info-card {
		background: #fff;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 24px;
		text-align: center;
	}

	.info-icon {
		width: 56px;
		height: 56px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		margin: 0 auto 16px;
	}

	.info-card h3 {
		font-size: 1rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.info-card p {
		font-size: 0.9rem;
		color: #8492a6;
		margin: 0;
		line-height: 1.5;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero {
			padding: 32px 20px 40px;
		}

		.hero h1 {
			font-size: 1.75rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.hero-stats {
			gap: 24px;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.hero-decoration {
			display: none;
		}

		.content {
			padding: 24px 16px;
		}

		.controls {
			flex-direction: column;
		}

		.category-pills {
			width: 100%;
			overflow-x: auto;
			flex-wrap: nowrap;
			padding-bottom: 8px;
		}

		.pill {
			flex-shrink: 0;
		}

		.view-toggle {
			align-self: flex-end;
		}

		.programs-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.program-card {
			padding: 16px;
		}

		.program-icon {
			width: 44px;
			height: 44px;
		}

		.program-card h3 {
			font-size: 0.9rem;
		}

		.program-row {
			flex-wrap: wrap;
			gap: 12px;
		}

		.row-content {
			order: 1;
			width: calc(100% - 72px);
		}

		.row-meta {
			order: 2;
			flex-direction: row;
			width: 100%;
		}

		.row-complete {
			order: 3;
			width: 100%;
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.programs-grid {
			grid-template-columns: 1fr;
		}

		.program-card {
			aspect-ratio: auto;
			padding: 24px;
		}
	}
</style>
