<script>
	import InviteCoLeaderModal from '$lib/InviteCoLeaderModal.svelte';
	import { goto } from '$app/navigation';
	
	let { data } = $props();
	let showModal = $state(true);
	
	function handleClose() {
		showModal = false;
		goto('/my-club');
	}
</script>

<svelte:head>
	<title>Invite Co-Leader - Hack Club</title>
</svelte:head>

<div class="page-container">
	<div class="page-content">
		<div class="back-section">
			<a href="/my-club" class="back-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to My Club
			</a>
		</div>
		
		<div class="card">
			<div class="card-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
					<circle cx="8.5" cy="7" r="4"/>
					<line x1="20" y1="8" x2="20" y2="14"/>
					<line x1="23" y1="11" x2="17" y2="11"/>
				</svg>
			</div>
			<h1>Invite a Co-Leader</h1>
			<p>Share the responsibility of running your club with another leader.</p>
			
			{#if data.club}
				<button class="btn-primary" onclick={() => showModal = true}>
					Invite to {data.club.name}
				</button>
			{:else}
				<p class="no-club">Please select a club first from <a href="/my-club">My Club</a>.</p>
			{/if}
		</div>
	</div>
</div>

{#if data.club}
	<InviteCoLeaderModal 
		bind:open={showModal} 
		clubId={data.club.id} 
		clubName={data.club.name}
		onClose={handleClose}
	/>
{/if}

<style>
	.page-container {
		min-height: 100vh;
		background: #f9fafc;
		padding: 24px;
	}
	
	.page-content {
		max-width: 500px;
		margin: 0 auto;
	}
	
	.back-section {
		margin-bottom: 24px;
	}
	
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: #338eda;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		transition: color 0.2s;
	}
	
	.back-link:hover {
		color: #2a7bc5;
	}
	
	.card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 16px;
		padding: 48px 32px;
		text-align: center;
	}
	
	.card-icon {
		width: 80px;
		height: 80px;
		background: #33d6a6;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
		color: white;
	}
	
	.card h1 {
		margin: 0 0 12px;
		font-size: 24px;
		color: #1f2d3d;
	}
	
	.card p {
		margin: 0 0 24px;
		color: #8492a6;
		font-size: 15px;
		line-height: 1.5;
	}
	
	.btn-primary {
		padding: 14px 28px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
	}
	
	.btn-primary:hover {
		background: #d62c47;
		transform: translateY(-2px);
	}
	
	.no-club {
		color: #8492a6;
	}
	
	.no-club a {
		color: #338eda;
		text-decoration: none;
	}
	
	.no-club a:hover {
		text-decoration: underline;
	}
</style>
