<script>
	import EventGrid from "./EventGrid.svelte";
	import EventModal from "./EventModal.svelte";
	import ToolCard from "./ToolCard.svelte";
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
		<p class="placeholder-text"></p>
	{/if}
	<p class="description">Useful tools and resources for running your club.</p>

	<div class="tools-grid">
		<ToolCard
			href="https://project.hackclub.com/"
			featured
			title="Create Your Own YSWS"
			description="Design custom You Ship, We Ship programs for your club with your own requirements and rewards"
			actionText="Apply Now"
		>
			{#snippet icon()}
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{/snippet}
		</ToolCard>

		<ToolCard
			href="https://spaces.hackclub.com/"
			featured
			title="Hack Club Spaces"
			description="Virtual development environments for Hack Clubbers. VSCode, Blender, KiCad, and more, in the cloud."
			actionText="Try now!"
		>
			{#snippet icon()}
				<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="flag" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M10.953 5.034a1 1 0 0 0-1.225.707L4.034 26.992a1 1 0 1 0 1.932.517l5.694-21.25a1 1 0 0 0-.707-1.225zm2.107 9.005c.425-1.703.798-3.036 1.225-4.079.429-1.058.766-1.43.912-1.532a.216.216 0 0 0 .022-.023l.017.003c.131-.022.133-.021.353.073l.065.028c.584.23 1.492.826 2.826 2.076 1.584 1.462 3.173 2.338 4.36 2.738a9.906 9.906 0 0 0 2.045.4c-.312 1.161-.627 2.297-1.028 3.334-.405 1.061-.756 1.774-1.284 2.307-.385.41-.719.542-1.131.527-.519-.018-1.447-.289-2.901-1.37-1.746-1.291-3.25-2.073-4.327-2.514a17.61 17.61 0 0 0-1.498-.524c.08-.375.193-.838.344-1.444zm12.104-1.615a.522.522 0 0 1 0 0zm-13.21 2.816l.017.008a.08.08 0 0 1-.017-.008zm-.834-1.685c1.727-6.93 3.174-9.634 8.727-4.43 2.833 2.655 4.933 2.646 6.14 2.641 1.16-.005 1.494-.007.86 2.359-1.294 4.83-3.053 10.796-9.5 6-2.638-1.962-4.392-2.486-5.449-2.801-1.526-.456-1.599-.478-.778-3.769z"/></svg>			{/snippet}
		</ToolCard>

		<ToolCard
			placeholder
			title="More Tools Coming Soon"
			description="We're working on more resources to help you run an amazing club. Stay tuned!"
		>
			{#snippet icon()}
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			{/snippet}
		</ToolCard>
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
		color: var(--color-text);
		font-weight: bold;
		font-size: 32px;
		margin: 0 0 8px 0;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.description {
		color: var(--color-muted);
		font-size: 16px;
		margin-bottom: 32px;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	@media (max-width: 900px) {
		.tools-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: 28px;
		}
	}
</style>
