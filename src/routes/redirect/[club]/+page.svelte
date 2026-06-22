<script>
	import { onMount } from 'svelte';
	
	let { data } = $props();
	
	let countdown = $state(5);
	let redirecting = $state(false);
	
	onMount(() => {
		const interval = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearInterval(interval);
				redirect();
			}
		}, 1000);
		
		return () => clearInterval(interval);
	});
	
	function redirect() {
		redirecting = true;
		window.location.href = data.clubWebsite;
	}
	
	function cancel() {
		window.location.href = 'https://hackclub.com';
	}
</script>

<svelte:head>
	<title>Redirecting to {data.clubName} - Hack Club</title>
</svelte:head>

<div class="container">
	<div class="warning-card">
		
		<h1>Entering Club Site</h1>
		
		<p class="description">
			You're about to visit <strong>{data.clubName}</strong>'s website. This is a community club and their website is not managed by Hack Club HQ.
		</p>
		
		<p class="url">
			<a href={data.clubWebsite} target="_blank" rel="noopener noreferrer">{data.clubWebsite}</a>
		</p>
		
		{#if !redirecting}
			<p class="countdown">Redirecting in {countdown} seconds...</p>
		{:else}
			<p class="countdown">Redirecting...</p>
		{/if}
		
		<div class="buttons">
			<button class="continue-btn" onclick={redirect} disabled={redirecting}>
				Continue to Website
			</button>
			<button class="cancel-btn" onclick={cancel}>
				Cancel
			</button>
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		background: var(--bg-sunken);
	}
	
	.warning-card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 40px;
		max-width: 500px;
		width: 100%;
		text-align: center;
	}
	
	.icon {
		color: #ff8c37;
		margin-bottom: 24px;
	}
	
	h1 {
		font-size: 24px;
		color: var(--color-text);
		margin: 0 0 16px 0;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}
	
	.description {
		font-size: 16px;
		color: var(--color-muted);
		line-height: 1.6;
		margin: 0 0 16px 0;
	}
	
	.description strong {
		color: var(--color-text);
	}
	
	.url {
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 12px;
		margin: 0 0 16px 0;
		word-break: break-all;
	}
	
	.url a {
		color: #338eda;
		text-decoration: none;
		font-size: 14px;
	}
	
	.url a:hover {
		text-decoration: underline;
	}
	
	.countdown {
		font-size: 14px;
		color: var(--color-muted);
		margin: 0 0 24px 0;
	}
	
	.buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
	}
	
	.continue-btn {
		padding: 12px 24px;
		background: #33d6a6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}
	
	.continue-btn:hover:not(:disabled) {
		background: #2bc095;
	}
	
	.continue-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.cancel-btn {
		padding: 12px 24px;
		background: var(--bg-sunken);
		color: var(--color-text);
		border: 2px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}
	
	.cancel-btn:hover {
		background: var(--color-border);
	}
	
	@media (max-width: 500px) {
		.buttons {
			flex-direction: column;
		}
	}
</style>
