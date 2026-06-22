<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let isSubmitting = $state(false);
	let hasLeft = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				hasLeft = true;
			}
			isSubmitting = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>Leave Club</title>
</svelte:head>

<div class="container">
	<div class="card">
		{#if hasLeft}
			<div class="success-icon">
				<img src="https://icons.hackclub.com/api/icons/white/checkmark" alt="Success" width="32" height="32" />
			</div>
			<h1>You've left the club</h1>
			<p class="message">You have successfully left <strong>{data.clubName}</strong>.</p>
			<a href="/" class="btn outline">Go to Home</a>
		{:else}
			<h1>Leave Club</h1>
			<p class="message">
				Are you sure you want to leave <strong>{data.clubName}</strong>?
			</p>
			<div class="member-info">
				<p><span class="label">Name:</span> {data.memberName}</p>
				{#if data.email}
					<p><span class="label">Email:</span> {data.email}</p>
				{/if}
			</div>
			
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<form method="POST" use:enhance={handleSubmit}>
				<div class="button-group">
					<a href="/" class="btn outline">Cancel</a>
					<button type="submit" class="btn danger-btn" disabled={isSubmitting}>
						{isSubmitting ? 'Leaving...' : 'Leave Club'}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background-color: var(--bg-sunken);
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 48px;
		max-width: 480px;
		width: 100%;
		text-align: center;
	}

	h1 {
		color: var(--color-text);
		font-size: 28px;
		margin: 0 0 16px 0;
	}

	.message {
		color: var(--color-muted);
		font-size: 16px;
		margin-bottom: 24px;
	}

	.message strong {
		color: var(--color-text);
	}

	.member-info {
		background: var(--bg-sunken);
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 24px;
		text-align: left;
	}

	.member-info p {
		margin: 8px 0;
		color: var(--color-text);
	}

	.label {
		color: var(--color-muted);
		font-weight: 600;
	}

	.button-group {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.danger-btn {
		background: var(--red) !important;
		border-color: var(--red) !important;
	}

	.danger-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.error {
		color: #ec3750;
		background: light-dark(#fef2f2, rgba(236, 55, 80, 0.16));
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.success-icon {
		width: 64px;
		height: 64px;
		background: #33d6a6;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		margin: 0 auto 24px auto;
	}
</style>
