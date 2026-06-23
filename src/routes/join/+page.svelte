<script>
	import { enhance } from '$app/forms';

	let { form } = $props();

	let isSubmitting = $state(false);
	let hasJoined = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				hasJoined = true;
			}
			isSubmitting = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>Join a Club</title>
</svelte:head>

<div class="container">
	<div class="card">
		{#if hasJoined}
			<div class="success-icon">
				<img src="https://icons.hackclub.com/api/icons/white/checkmark" alt="Success" width="32" height="32" />
			</div>
			<h1>You're in!</h1>
			<p class="message">You've successfully joined the club.</p>
			<a href="https://hackclub.com" class="btn">Go to hackclub.com</a>
		{:else}
			<h1>Join a Club</h1>
			<p class="message">Enter your details below to join the club.</p>

			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<form method="POST" use:enhance={handleSubmit}>
				<div class="field">
					<label for="name">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						placeholder="Your name"
						value={form?.name ?? ''}
						required
						autocomplete="name"
					/>
				</div>

				<div class="field">
					<label for="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="you@example.com"
						value={form?.email ?? ''}
						required
						autocomplete="email"
					/>
				</div>

				<div class="field">
					<label for="joinCode">Join Code</label>
					<input
						id="joinCode"
						name="joinCode"
						type="text"
						placeholder="ABC123"
						value={form?.joinCode ?? ''}
						required
						minlength="2"
						maxlength="6"
						pattern="[A-Za-z1-9]{'{'}2,6{'}'}"
						autocapitalize="characters"
						autocomplete="off"
						style="text-transform: uppercase;"
					/>
				</div>

				<button type="submit" class="btn" disabled={isSubmitting}>
					{isSubmitting ? 'Joining...' : 'Join Club'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		background-color: var(--bg-page);
		color: var(--color-text);
		margin: 0;
		padding: 0;
	}

	.container {
		max-width: 480px;
		margin: 0 auto;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 48px 16px;
		box-sizing: border-box;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 48px;
		width: 100%;
		box-sizing: border-box;
		text-align: center;
	}

	@media (max-width: 480px) {
		.card {
			padding: 32px 24px;
		}
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

	.field {
		text-align: left;
		margin-bottom: 20px;
	}

	label {
		display: block;
		color: var(--color-text);
		font-weight: 600;
		font-size: 14px;
		margin-bottom: 6px;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 12px 14px;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		font-size: 16px;
		font-family: inherit;
		background: var(--bg-card);
		color: var(--color-text);
	}

	input:focus {
		outline: none;
		border-color: #ec3750;
	}

	.btn {
		display: inline-block;
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		text-align: center;
		text-decoration: none;
		padding: 12px 16px;
		color: #ffffff;
		background: #ec3750;
		border: 2px solid #ec3750;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		font-weight: 700;
		font-size: 16px;
	}

	.btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
		margin: 0 auto 24px auto;
	}
</style>
