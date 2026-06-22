<script>
	let {
		href = null,
		title,
		description,
		featured = false,
		placeholder = false,
		actionText = null,
		icon
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	href={href}
	target={href ? '_blank' : undefined}
	rel={href ? 'noopener noreferrer' : undefined}
	class="tool-card"
	class:featured
	class:placeholder
>
	<div class="tool-icon">
		{@render icon()}
	</div>
	<h3 class="tool-title">{title}</h3>
	<p class="tool-description">{description}</p>
	{#if actionText}
		<div class="tool-action">
			<span class="action-text">{actionText}</span>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
	{/if}
</svelte:element>

<style>
	.tool-card {
		padding: 24px;
		border-radius: 12px;
		border: 2px solid var(--color-border);
		background: var(--bg-card);
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tool-card:hover {
		border-color: #ec3750;
		transform: scale(1.03);
	}

	.tool-card.featured {
		background: var(--bg-card);
		border: 3px solid #ec3750;
		position: relative;
		overflow: hidden;
	}

	.tool-card.placeholder {
		opacity: 0.6;
		cursor: default;
	}

	.tool-card.placeholder:hover {
		border-color: var(--color-border);
		transform: none;
		box-shadow: none;
	}

	.tool-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: #ec3750;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-icon :global(svg) {
		width: 28px;
		height: 28px;
	}

	.tool-card.placeholder .tool-icon {
		background: var(--color-border);
		color: var(--color-muted);
	}

	.tool-title {
		font-size: 20px;
		font-weight: bold;
		color: var(--color-text);
		margin: 0;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.tool-description {
		color: var(--color-muted);
		font-size: 14px;
		line-height: 1.5;
		margin: 0;
		flex-grow: 1;
	}

	.tool-action {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #ec3750;
		font-weight: 600;
		font-size: 14px;
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
		.tool-card {
			padding: 24px;
		}
	}
</style>
