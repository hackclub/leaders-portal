<script>
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
			if (onRefresh) {
				onRefresh(data.club);
			}
		} catch (err) {
			error = err.message;
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
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text);
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

	:global(:root[data-theme='dark']) .refresh-icon {
		filter: invert(1);
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light'])) .refresh-icon {
			filter: invert(1);
		}
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
