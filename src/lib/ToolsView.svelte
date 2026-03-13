<script>
	import EventGrid from "./EventGrid.svelte";
	import EventModal from "./EventModal.svelte";
	import { onMount } from "svelte";

	let { user } = $props();
	let events = $state([]);
	let selectedEvent = $state(null);

	onMount(async () => {
		try {
			const response = await fetch('/api/events');
			if (response.ok) {
				const allEvents = await response.json();
				events = allEvents.filter(e => e.type === 'Tools');
			}
		} catch (error) {
			console.error('Error fetching events:', error);
		}
	});

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
				events[eventIndex] = originalEvent;
			}
		} catch (error) {
			events[eventIndex] = originalEvent;
		}
	}
</script>

<div class="tools-view">
	<h2 class="section-title">Club Tools</h2>
	{#if events.length > 0}
		<EventGrid {events} category={null} {openEvent} onComplete={handleComplete} isLoggedIn={!!user} />
	{:else}
		<p class="placeholder-text">No tools available yet.</p>
	{/if}
	<p class="description">Useful tools and resources for running your club.</p>

	<div class="tools-grid">
		<a href="https://project.hackclub.com/" target="_blank" rel="noopener noreferrer" class="tool-card featured">
			<div class="tool-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<h3 class="tool-title">Create Your Own YSWS</h3>
			<p class="tool-description">
				Design custom You Ship, We Ship programs for your club with your own requirements and rewards
			</p>
			<div class="tool-action">
				<span class="action-text">Apply Now</span>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
		</a>

		<div class="tool-card placeholder">
			<div class="tool-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3 class="tool-title">More Tools Coming Soon</h3>
			<p class="tool-description">
				We're working on more resources to help you run an amazing club. Stay tuned!
			</p>
		</div>
	</div>
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}

<style>
	.tools-view {
		padding: 24px 0;
	}

	.section-title {
		color: #1f2d3d;
		font-weight: bold;
		font-size: 32px;
		margin: 0 0 8px 0;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.description {
		color: #8492a6;
		font-size: 16px;
		margin-bottom: 32px;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.tool-card {
		padding: 32px;
		border-radius: 12px;
		border: 2px solid #e0e6ed;
		background: white;
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.tool-card:hover {
		border-color: #ec3750;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(236, 55, 80, 0.15);
	}

	.tool-card.featured {
		background: linear-gradient(135deg, #fff5f7 0%, #ffffff 100%);
		border: 3px solid #ec3750;
		position: relative;
		overflow: hidden;
	}

	.tool-card.featured::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 100px;
		height: 100px;
		background: radial-gradient(circle, rgba(236, 55, 80, 0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.tool-card.placeholder {
		opacity: 0.6;
		cursor: default;
	}

	.tool-card.placeholder:hover {
		border-color: #e0e6ed;
		transform: none;
		box-shadow: none;
	}

	.tool-icon {
		width: 64px;
		height: 64px;
		border-radius: 12px;
		background: #ec3750;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-card.placeholder .tool-icon {
		background: #e0e6ed;
		color: #8492a6;
	}

	.tool-title {
		font-size: 24px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.tool-description {
		color: #8492a6;
		font-size: 16px;
		line-height: 1.6;
		margin: 0;
		flex-grow: 1;
	}

	.tool-action {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #ec3750;
		font-weight: 600;
		font-size: 16px;
	}

	.tool-card.featured:hover .tool-action {
		gap: 12px;
	}

	.tool-card.featured .tool-action svg {
		transition: transform 0.2s ease;
	}

	.tool-card.featured:hover .tool-action svg {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: 28px;
		}

		.tool-card {
			padding: 24px;
		}
	}
</style>
