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
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}

<style>
	.tools-view {
		padding: 32px;
		border-radius: 24px;
		background: #fef3c7;
		border: 3px solid #f1c40f;
		text-align: center;
	}

	.section-title {
		color: #1f2d3d;
		font-weight: bold;
		font-size: 32px;
		margin: 0 0 16px 0;
	}

	.placeholder-text {
		color: #8492a6;
		font-size: 16px;
		margin-bottom: 24px;
	}
</style>
