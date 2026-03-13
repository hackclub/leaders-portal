<script>
	export let event;
</script>

<a 
	class="event-banner" 
	style="background-color: {event.color}; {event.backgroundUrl ? `background-image: url('${event.backgroundUrl}'); background-size: cover; background-position: center;` : ''}"
	href={event.link}
	target="_blank"
	rel="noopener noreferrer"
>
	{#if event.backgroundUrl}
		<div class="banner-overlay"></div>
	{/if}
	<div class="banner-content">
		<img src={event.icon} alt="{event.title} icon" class="banner-icon" />
		<p class="banner-description" style="color: {event.textColor};">{event.description}</p>
	</div>
</a>

<style>
	.event-banner {
		border-radius: 12px;
		padding: 48px 24px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		font-weight: 800;
		position: relative;
		overflow: hidden;
		margin-bottom: 24px;
		text-decoration: none;
		height: 250px;
	}

	.event-banner:hover {
		transform: scale(1.02);
	}

	.banner-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.banner-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		position: relative;
		z-index: 1;
		text-align: center;
		height: 100%;
		overflow: hidden;
	}

	.banner-icon {
		max-width: 500px;
		max-height: 60%;
		object-fit: contain;
		flex-shrink: 1;
		min-height: 0;
	}

	.banner-description {
		font-size: 25px;
		margin: 0;
		max-width: 600px;
		line-height: 1.5;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.event-banner {
			padding: 32px 16px;
			height: 180px;
		}

		.banner-icon {
			width: 60px;
			height: 60px;
		}

		.banner-description {
			font-size: 16px;
		}

		.banner-buttons {
			flex-direction: column;
			width: 100%;
		}

		.banner-button {
			text-align: center;
		}
	}
</style>
