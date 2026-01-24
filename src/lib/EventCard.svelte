<script>
	export let event;
	export let openEvent;
	export let onComplete;
	export let isLoggedIn;

	let showTooltip = false;

	async function toggleComplete(e) {
		e.stopPropagation();
		showTooltip = false;
		await onComplete(event.id, !event.completed);
	}

	function handleMouseEnter() {
		showTooltip = true;
	}

	function handleMouseLeave() {
		showTooltip = false;
	}
</script>

<div
	class="event-card"
	style="background-color: {event.color}; {event.backgroundUrl
		? `background-image: url('${event.backgroundUrl}'); background-size: cover; background-position: center;`
		: ''}"
	on:click={() => openEvent(event)}
	on:keydown={(e) => e.key === 'Enter' && openEvent(event)}
	role="button"
	tabindex="0"
>
	{#if event.backgroundUrl}
		<div class="background-overlay"></div>
	{/if}
	{#if isLoggedIn}
		<div class="complete-wrapper">
			<button
				class="complete-button"
				class:completed={event.completed}
				on:click={toggleComplete}
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				aria-label={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
			>
				{#if event.completed}
					<span class="checkmark">✓</span>
				{:else}
					<span class="circle"></span>
				{/if}
			</button>
			{#if showTooltip}
				<div class="tooltip">
					{event.completed ? 'Mark incomplete' : 'Mark complete'}
				</div>
			{/if}
		</div>
	{/if}
	<div class="event-compact">
		{#if event.category == 'Hardware'}
			<img src={event.icon} alt="{event.title} icon" class="event-icon-hardware" />
		{:else}
			<img src={event.icon} alt="{event.title} icon" class="event-icon" />
		{/if}
		<h3 style="color: {event.textColor};">{event.title}</h3>
		<span class="type-badge">{event.type}</span>
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

	.complete-wrapper {
		position: absolute;
		top: 8px;
		right: 8px;
		z-index: 10;
	}

	.complete-button {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.95);
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.complete-button:hover {
		transform: scale(1.15);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.complete-button:active {
		transform: scale(1.05);
	}

	.circle {
		width: 18px;
		height: 18px;
		border: 2.5px solid #9ca3af;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.complete-button:hover .circle {
		border-color: #33d9b2;
		background-color: rgba(51, 217, 178, 0.1);
	}

	.checkmark {
		color: #ffffff;
		font-size: 20px;
		font-weight: bold;
		line-height: 1;
	}

	.complete-button.completed {
		background-color: #33d9b2;
	}

	.complete-button.completed:hover {
		background-color: #2ecc9d;
	}

	.tooltip {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 6px;
		padding: 6px 10px;
		background-color: rgba(0, 0, 0, 0.85);
		color: white;
		font-size: 12px;
		font-weight: 600;
		border-radius: 6px;
		white-space: nowrap;
		pointer-events: none;
		z-index: 100;
	}

	.tooltip::before {
		content: '';
		position: absolute;
		bottom: 100%;
		right: 10px;
		border: 5px solid transparent;
		border-bottom-color: rgba(0, 0, 0, 0.85);
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
			width: 28px;
			height: 28px;
		}

		.checkmark {
			font-size: 18px;
		}

		.circle {
			width: 16px;
			height: 16px;
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
