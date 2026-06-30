<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let hasJoined = $state(false);

	const colors = data.colors ?? {};
	const bgColor = colors.bgColor || '#f9fafc';
	const colorStyle = [
		`--join-bg: ${bgColor}`,
		`--join-card: ${colors.cardColor || '#ffffff'}`,
		`--join-text: ${colors.textColor || '#1f2d3d'}`,
		`--join-btn: ${colors.buttonColor || '#ec3750'}`
	].join('; ');
	const bodyStyleTag = `<style>html, body { background-color: ${bgColor} !important; }</style>`;

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
	<title>Join {data.clubName}</title>
	{@html bodyStyleTag}
</svelte:head>

<div class="container" style={colorStyle}>
	<div class="card">
		{#if hasJoined}
			<div class="success-icon">
				<img src="https://icons.hackclub.com/api/icons/white/checkmark" alt="Success" width="32" height="32" />
			</div>
			<h1>You're in!</h1>
			<p class="message">You've successfully joined <strong>{data.clubName}</strong>.</p>
			<a href="https://hackclub.com" class="btn">Go to hackclub.com</a>
		{:else}
			<h1>Join {data.clubName}</h1>
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

				<button type="submit" class="btn" disabled={isSubmitting}>
					{isSubmitting ? 'Joining...' : 'Join Club'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.container {
		margin: 0 auto;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 16px;
		box-sizing: border-box;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		color: var(--join-text);
		background: var(--join-bg);
	}

	.card {
		background: var(--join-card);
		border: 2px solid color-mix(in srgb, var(--join-text) 12%, transparent);
		border-radius: 12px;
		padding: 48px;
		width: 100%;
		max-width: 480px;
		box-sizing: border-box;
		text-align: center;
	}

	@media (max-width: 480px) {
		.card {
			padding: 32px 24px;
		}
	}

	h1 {
		color: var(--join-text);
		font-size: 28px;
		margin: 0 0 16px 0;
	}

	.message {
		color: color-mix(in srgb, var(--join-text) 65%, transparent);
		font-size: 16px;
		margin-bottom: 24px;
	}

	.message strong {
		color: var(--join-text);
	}

	.field {
		text-align: left;
		margin-bottom: 20px;
	}

	label {
		display: block;
		color: var(--join-text);
		font-weight: 600;
		font-size: 14px;
		margin-bottom: 6px;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 12px 14px;
		border: 2px solid color-mix(in srgb, var(--join-text) 18%, transparent);
		border-radius: 8px;
		font-size: 16px;
		font-family: inherit;
		background: var(--join-card);
		color: var(--join-text);
	}

	input:focus {
		outline: none;
		border-color: var(--join-btn);
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
		background: var(--join-btn);
		border: 2px solid var(--join-btn);
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
