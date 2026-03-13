<script>
	export let event;
	export let openEvent;
	export let onComplete;
	export let isLoggedIn;
	export let highlighted = false;
	export let highlightColor = '#ec3750';

	async function toggleComplete(e) {
		e.stopPropagation();
		await onComplete(event.id, !event.completed);
	}
</script>

<div class="event-card" class:highlighted style="background-color: {event.color}; {event.backgroundUrl ? `background-image: url('${event.backgroundUrl}'); background-size: cover; background-position: center;` : ''} {highlighted ? `--highlight-color: ${highlightColor};` : ''}" on:click={() => openEvent(event)} on:keydown={(e) => e.key === 'Enter' && openEvent(event)} role="button" tabindex="0">
	{#if event.backgroundUrl}
		<div class="background-overlay"></div>
	{/if}
	{#if isLoggedIn}
		<button 
			class="complete-button" 
			class:completed={event.completed}
			on:click={toggleComplete}
			aria-label={event.completed ? "Mark as incomplete" : "Mark as complete"}
			title={event.completed ? "Mark as incomplete" : "Mark as complete"}
		>
			✓
		</button>
	{/if}
	<div class="event-compact">
		{#if event.category == "Hardware"}
		<img src={event.icon} alt="{event.title} icon" class="event-icon-hardware" />
		{:else}
		<img src={event.icon} alt="{event.title} icon" class="event-icon" />
		{/if}
		<h3 style="color: {event.textColor};">{event.title}</h3>
		<span class="type-badge" class:type-badge-highlighted={highlighted} style="background-color: {event.buttonColor}; color: {event.buttonTextColor};">{event.type}</span>
		<span class="et" style="color: {event.textColor};">Estimated time: {event.et}</span>
	</div>
</div>

<style>
	.event-card {
		border-radius: 12px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		font-weight: 800;
		position: relative;
		overflow: hidden;
	}

	.background-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.event-card:hover {
		transform: translateY(-2px);
	}

	.event-card.highlighted {
		border: 3px solid var(--highlight-color, #ec3750);
	}

	.type-badge-highlighted {
		background: var(--highlight-color, #ec3750);
	}

	.event-compact {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		height: 100%;
		gap: 8px;
	}

	.event-icon {
		width: 40px;
		height: 40px;
		margin-bottom: 4px;
	}

	.event-icon-hardware {
		max-width: 60px;
		max-height: 60px;
		margin-bottom: 4px;
	}

	.event-compact h3 {
		font-size: 16px;
		margin: 0;
		font-weight: 900;
	}

	.type-badge {
		display: inline-block;
		background: #ec3750;
		color: #ffffff;
		padding: 3px 8px;
		border-radius: 999px;
		font-size: 11px;
		font-weight: bold;
		width: fit-content;
	}

	.et {
		font-size: 14px;
		opacity: 0.9;
	}

	.complete-button {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 28px;
		height: 28px;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		color: transparent;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.complete-button:hover {
		background-color: rgba(255, 255, 255, 0.4);
		border-color: rgba(255, 255, 255, 0.8);
		transform: scale(1.1);
	}

	.complete-button.completed {
		background-color: #33d9b2;
		border-color: #33d9b2;
		color: white;
	}

	.complete-button.completed:hover {
		background-color: #2ecc9d;
		border-color: #2ecc9d;
	}

	@media (max-width: 768px) {
		.event-card {
			padding: 14px;
		}

		.event-compact h3 {
			font-size: 14px;
		}

		.event-icon {
			width: 32px;
			height: 32px;
		}

		.event-icon-hardware {
			max-width: 48px;
			max-height: 48px;
		}

		.type-badge {
			font-size: 10px;
			padding: 2px 6px;
		}

		.et {
			font-size: 12px;
		}

		.complete-button {
			width: 24px;
			height: 24px;
			font-size: 14px;
		}
	}

	@media (max-width: 480px) {
		.event-card {
			aspect-ratio: auto;
			padding: 16px;
		}

		.event-compact {
			flex-direction: row;
			justify-content: flex-start;
			text-align: left;
			gap: 12px;
		}

		.event-compact h3 {
			font-size: 15px;
			flex: 1;
		}

		.event-icon,
		.event-icon-hardware {
			width: 40px;
			height: 40px;
			max-width: 40px;
			max-height: 40px;
			margin-bottom: 0;
		}

		.type-badge,
		.et {
			display: none;
		}
	}
</style>
