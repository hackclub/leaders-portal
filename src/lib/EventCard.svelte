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

<div 
	class="event-card" 
	class:highlighted 
	style="background-color: {event.color}; {event.backgroundUrl ? `background-image: url('${event.backgroundUrl}'); background-size: cover; background-position: center;` : ''} {highlighted ? `--highlight-color: ${highlightColor};` : ''}" 
	onclick={() => openEvent(event)} 
	onkeydown={(e) => e.key === 'Enter' && openEvent(event)} 
	role="button" 
	tabindex="0"
>
	{#if event.backgroundUrl}
		<div class="background-overlay"></div>
	{/if}
	{#if isLoggedIn}
		<button 
			class="complete-button" 
			class:completed={event.completed}
			onclick={toggleComplete}
			aria-label={event.completed ? "Mark as incomplete" : "Mark as complete"}
			title={event.completed ? "Mark as incomplete" : "Mark as complete"}
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		</button>
	{/if}
	<div class="event-compact">
		{#if event.category === "Hardware"}
			<img src={event.icon} alt="{event.title} icon" class="event-icon-hardware" />
		{:else}
			<img src={event.icon} alt="{event.title} icon" class="event-icon" />
		{/if}
		<h3 style="color: {event.textColor};">{event.title}</h3>
		<span class="type-badge" class:type-badge-highlighted={highlighted} style="background-color: {event.buttonColor}; color: {event.buttonTextColor};">{event.type}</span>
		<span class="et" style="color: {event.textColor};">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<circle cx="12" cy="12" r="10"/>
				<polyline points="12,6 12,12 16,14"/>
			</svg>
			{event.et}
		</span>
	</div>
</div>

<style>
	.event-card {
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-4, 16px);
		cursor: pointer;
		transition: all var(--transition-normal, 200ms ease);
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		font-weight: 700;
		position: relative;
		overflow: hidden;
		border: 2px solid transparent;
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
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg, 0 10px 20px rgba(31, 45, 61, 0.1));
	}

	.event-card:focus-visible {
		outline: 3px solid var(--hc-blue, #338eda);
		outline-offset: 2px;
	}

	.event-card.highlighted {
		border: 3px solid var(--highlight-color, #ec3750);
		box-shadow: 0 0 0 3px rgba(236, 55, 80, 0.1);
	}

	.type-badge-highlighted {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	.event-compact {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		height: 100%;
		gap: var(--space-2, 8px);
		position: relative;
		z-index: 1;
	}

	.event-icon {
		width: 48px;
		height: 48px;
		margin-bottom: var(--space-1, 4px);
		object-fit: contain;
	}

	.event-icon-hardware {
		max-width: 64px;
		max-height: 64px;
		margin-bottom: var(--space-1, 4px);
		object-fit: contain;
	}

	.event-compact h3 {
		font-size: 1rem;
		margin: 0;
		font-weight: 800;
		line-height: 1.25;
	}

	.type-badge {
		display: inline-block;
		background: var(--hc-red, #ec3750);
		color: var(--hc-white, #ffffff);
		padding: var(--space-1, 4px) var(--space-2, 8px);
		border-radius: var(--radius-full, 9999px);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.et {
		font-size: 0.8125rem;
		font-weight: 600;
		opacity: 0.85;
	}

	.complete-button {
		position: absolute;
		top: var(--space-2, 8px);
		right: var(--space-2, 8px);
		width: 32px;
		height: 32px;
		border: 2px solid rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		color: transparent;
		cursor: pointer;
		transition: all var(--transition-fast, 150ms ease);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		z-index: 2;
	}

	.complete-button:hover {
		background-color: rgba(255, 255, 255, 0.5);
		border-color: rgba(255, 255, 255, 1);
		transform: scale(1.1);
	}

	.complete-button.completed {
		background-color: var(--hc-green, #33d6a6);
		border-color: var(--hc-green, #33d6a6);
		color: white;
	}

	.complete-button.completed:hover {
		background-color: var(--hc-green-dark, #2ab88c);
		border-color: var(--hc-green-dark, #2ab88c);
	}

	@media (max-width: 768px) {
		.event-card {
			padding: var(--space-3, 12px);
		}

		.event-compact h3 {
			font-size: 0.875rem;
		}

		.event-icon {
			width: 36px;
			height: 36px;
		}

		.event-icon-hardware {
			max-width: 48px;
			max-height: 48px;
		}

		.type-badge {
			font-size: 0.625rem;
			padding: 3px 6px;
		}

		.et {
			font-size: 0.75rem;
		}

		.complete-button {
			width: 28px;
			height: 28px;
		}

		.complete-button svg {
			width: 14px;
			height: 14px;
		}
	}

	@media (max-width: 480px) {
		.event-card {
			aspect-ratio: auto;
			padding: var(--space-4, 16px);
		}

		.event-compact {
			flex-direction: row;
			justify-content: flex-start;
			text-align: left;
			gap: var(--space-3, 12px);
		}

		.event-compact h3 {
			font-size: 0.9375rem;
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
