<script>
	import EventBanner from '$lib/EventBanner.svelte';
	
	let { user, bannerEvents = [] } = $props();
</script>

{#if bannerEvents.length > 0}
	{#each bannerEvents as event}
		<EventBanner {event} />
	{/each}
{:else}
	<p class="placeholder-text">No event banners available.</p>
{/if}

<style>
	.placeholder-text {
		color: var(--color-muted);
		font-size: 16px;
		text-align: center;
		padding: 32px;
	}
</style>
