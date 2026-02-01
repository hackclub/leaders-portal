<script>
	import { toasts } from '$lib/stores/toast.js';
	
	let { clubName, onRefresh } = $props();
	let isRefreshing = $state(false);
	let lastRefreshed = $state(null);
	let error = $state(null);

	async function refresh() {
		if (isRefreshing) return;
		
		isRefreshing = true;
		error = null;

		try {
			const response = await fetch('/api/club/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ clubName })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to refresh');
			}

			lastRefreshed = new Date();
			toasts.success('Club data refreshed!');
			if (onRefresh) {
				onRefresh(data.club);
			}
		} catch (err) {
			error = err.message;
			toasts.error(err.message || 'Failed to refresh');
			console.error('[RefreshButton] Error:', err);
		} finally {
			isRefreshing = false;
		}
	}
</script>

<button 
	class="refresh-button" 
	onclick={refresh}
	disabled={isRefreshing}
	title="Refresh club data from API"
>
	<img 
		class="refresh-icon {isRefreshing ? 'spinning' : ''}" 
		src="https://icons.hackclub.com/api/icons/black/view-reload" 
		alt="Refresh icon"
		width="24"
		height="24"
	/>
	<span class="refresh-text">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
</button>

{#if error}
	<span class="refresh-error">{error}</span>
{/if}

<style>
	.refresh-button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.refresh-button:hover:not(:disabled) {
		border-color: #338eda;
		color: #338eda;
	}

	.refresh-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.refresh-icon {
		flex-shrink: 0;
	}

	.refresh-icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.refresh-text {
		white-space: nowrap;
	}

	.refresh-error {
		color: #ec3750;
		font-size: 12px;
		margin-left: 8px;
	}
</style>
