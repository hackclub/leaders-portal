<script>
	import { onMount } from 'svelte';
	import EventGrid from '$lib/EventGrid.svelte';
	import EventModal from '$lib/EventModal.svelte';
	import EventBanner from '$lib/EventBanner.svelte';

	let { data } = $props();
	let events = $state([]);
	let selectedEvent = $state(null);
	let hasWebdevEvents = $derived(events.some(e => e.category === 'Webdev'));
	let hasCadEvents = $derived(events.some(e => e.category === 'CAD'));
	let hasGamedevEvents = $derived(events.some(e => e.category === 'GameDev'));
	let hasHardwareEvents = $derived(events.some(e => e.category === 'Hardware'));
	let hasOtherEvents = $derived(events.some(e => e.category === 'Other'));
	let hasCompletedEvents = $derived(events.some(e => e.completed));
	let bannerEvent = $derived(events.find(e => e.category === 'Banner'));

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

<div class="container">
	<header>
		<iframe 
			src="https://hackclub.com/map?mode={data.user ? 'manage' : 'signin'}" 
			class="header-map"
			title="Hack Club Map"
			loading="lazy"
		></iframe>
		<div class="header-content">
			<h1 class="title">Club Leaders Portal</h1>
			<div class="header-buttons">
				{#if data.user}
					<a href="/my-club" class="nav-button">My Club</a>
					<a href="/settings" class="nav-button secondary">Settings</a>
					{#if data.user.isAdmin}
						<a href="/admin" class="nav-button">Admin</a>
					{/if}
					<form method="POST" action="/logout" style="display: inline;">
						<button type="submit" class="nav-button">Logout</button>
					</form>
				{:else}
					<a href="/auth/login" class="nav-button">Sign in with Hack Club</a>
					<a href="/email-login" class="nav-button secondary">Sign in with Email</a>
				{/if}
			</div>
		</div>
	</header>

	{#if bannerEvent}
		<EventBanner event={bannerEvent} />
	{/if}

	<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="help-button" aria-label="Club Leaders Guide">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			<circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
		</svg>
	</a>

	<main>
		{#if hasWebdevEvents}
			<div class="category-bubble webdev">
				<h2 class="section-title">Web development series:</h2>
				<EventGrid {events} category="Webdev" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}

		{#if hasCadEvents}
			<div class="category-bubble cad">
				<h2 class="section-title">CAD series:</h2>
				<EventGrid {events} category="CAD" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}

		{#if hasGamedevEvents}
			<div class="category-bubble gamedev">
				<h2 class="section-title">Game Development Series:</h2>
				<EventGrid {events} category="GameDev" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}
		
		{#if hasHardwareEvents}
			<div class="category-bubble hardware">
				<h2 class="section-title">Hardware Series:</h2>
				<EventGrid {events} category="Hardware" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}

		{#if hasOtherEvents}
			<div class="category-bubble other">
				<h2 class="section-title">Other Clubs YSWS:</h2>
				<EventGrid {events} category="Other" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}

		{#if hasCompletedEvents}
			<div class="category-bubble completed">
				<h2 class="section-title">Completed YSWS:</h2>
				<EventGrid {events} category="Completed" {openEvent} onComplete={handleComplete} isLoggedIn={!!data.user} />
			</div>
		{/if}
	</main>

	<footer>
		<a href="https://apply.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-button">
			Start a club
		</a>
		<a href="https://ysws.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-button">
			All YSWS Programs
		</a>
		<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-button">
			Club Leaders Guide
		</a>
		<a href="https://hackclub.com/map" target="_blank" rel="noopener noreferrer" class="footer-button">
			Club Map
		</a>
	</footer>
</div>

{#if selectedEvent}
	<EventModal event={selectedEvent} {closeModal} />
{/if}



<style>
	:global(body) {
		background-color: var(--white);
		color: var(--black);
		margin: 0;
		padding: 0;
	}



	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	header {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 32px;
		min-height: 500px;
		border-radius: 16px;
		overflow: hidden;
	}

	.header-map {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
		z-index: 0;
	}

	.header-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 40px 20px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 16px;
		pointer-events: none;
	}

	.header-content .title,
	.header-content .header-buttons,
	.header-content .nav-button {
		pointer-events: auto;
	}

	.title {
		font-size: 48px;
		font-weight: bold;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
		padding: 12px 24px;
		border-radius: 12px;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.nav-button {
		padding: 10px 20px;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		font-size: 14px;
		font-family: inherit;
		transition: all 0.2s;
		border: 2px solid var(--red);
		cursor: pointer;
		background-color: var(--red);
		color: var(--white);
		box-shadow: none;
	}

	.nav-button:hover {
		opacity: 0.9;
		box-shadow: none;
		transform: scale(1.0625);
	}

	.nav-button.secondary {
		background-color: var(--white);
		color: var(--red);
	}

	.nav-button.secondary:hover {
		background-color: var(--snow);
	}

	.footer-button {
		display: inline-block;
		padding: 12px 28px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.2s;
		background-color: var(--red);
		color: var(--white);
		box-shadow: none;
	}

	.footer-button:hover {
		opacity: 0.9;
		box-shadow: none;
		transform: scale(1.0625);
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}


	.category-bubble {
		padding: 32px;
		border-radius: 24px;
		margin-bottom: 24px;
		transition: transform 0.3s
	}

	.category-bubble:hover {
		transform: translateY(-4px);
	}

	.category-bubble.webdev {
		background: #dbeafe;
		border: 3px solid #338eda;
	}

	.category-bubble.cad {
		background: #fef3c7;
		border: 3px solid #f1c40f;
	}

	.category-bubble.gamedev {
		background: #eed7f7;
		border: 3px solid #a633d6;
	}

	.category-bubble.hardware {
		background: #d3ebf2;
		border: 3px solid #5bc0de;
	}

	.category-bubble.other {
		background: #fce7f3;
		border: 3px solid #ec3750;
	}

	.category-bubble.completed {
		background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
		border: 3px solid #33d6a6;
	}

	.section-title {
		color: #1f2d3d;
		font-weight: bold;
		font-size: 32px;
		margin: 0 0 16px 0;
	}

	.help-button {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background-color: #ec3750;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		z-index: 100;
	}

	.help-button:hover {
		background-color: #d63447;
		transform: translateY(-2px);
	}

	footer {
		text-align: center;
		margin-top: 48px;
		padding: 32px;
		border-radius: 16px;
		background-color: #f9fafc;
		border: 2px solid #e0e6ed;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	

	@media (max-width: 768px) {
		.container {
			padding: 16px 12px;
		}

		header {
			min-height: auto;
			margin-bottom: 24px;
		}

		.header-map {
			display: none;
		}

		.header-content {
			padding: 24px 16px;
			margin: 0;
			width: 100%;
			box-sizing: border-box;
			background: #f9fafc;
			border: 2px solid #e0e6ed;
		}

		.title {
			font-size: 28px;
			padding: 8px 16px;
			text-align: center;
		}

		.header-buttons {
			flex-wrap: wrap;
			justify-content: center;
			gap: 8px;
		}

		.nav-button {
			padding: 8px 14px;
			font-size: 13px;
		}

		.category-bubble {
			padding: 20px 16px;
			border-radius: 16px;
			margin-bottom: 16px;
		}

		.section-title {
			font-size: 22px;
			margin-bottom: 12px;
		}

		footer {
			padding: 20px 16px;
			margin-top: 32px;
			flex-direction: column;
			gap: 8px;
		}

		.footer-button {
			width: 100%;
			padding: 12px 20px;
		}

		.help-button {
			width: 48px;
			height: 48px;
			bottom: 16px;
			right: 16px;
		}
	}

	@media (max-width: 480px) {
		.title {
			font-size: 24px;
		}

		.header-buttons {
			flex-direction: column;
			width: 100%;
		}

		.nav-button {
			width: 100%;
			text-align: center;
		}

		.nav-button[type="submit"] {
			width: 100%;
		}

		header {
			min-height: 300px;
		}
	}
</style>