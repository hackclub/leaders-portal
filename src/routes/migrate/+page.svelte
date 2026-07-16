<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
	let hasShipped = $state(form?.hasShipped ?? '');
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	}
</script>

<svelte:head>
	<title>Migrate your club</title>
</svelte:head>

<div class="container">
	<div class="card">
		{#if form?.success}
			<div class="success-icon">
				<img src="https://icons.hackclub.com/api/icons/white/checkmark" alt="Success" width="32" height="32" />
			</div>
			<h1>Your club was migrated!</h1>
			<p class="message">Your club has been successfully submitted for migration.</p>
		{:else}
			<h1>Migrate your club</h1>
			<p class="message">Re-activate your club under our new system.</p>

			{#if form?.error}
				<p class="error" role="alert">{form.error}</p>
			{/if}

			<form method="POST" use:enhance={handleSubmit}>
				<fieldset class="field options">
					<legend>Has your club shipped a project yet?</legend>

					<div class="option-group">
						<label class="option" class:selected={hasShipped === 'yes'}>
							<input type="radio" name="hasShipped" value="yes" bind:group={hasShipped} />
							<span>Yes</span>
						</label>

						<label class="option" class:selected={hasShipped === 'no'}>
							<input type="radio" name="hasShipped" value="no" bind:group={hasShipped} />
							<span>No</span>
						</label>
					</div>
				</fieldset>


			{#if hasShipped}
				<div class="field">
					<label for="clubName">Club Name</label>
					<input
						id="clubName"
						name="clubName"
						type="text"
						placeholder="Your club's name"
						autocomplete="organization"
						value={form?.clubName ?? ''}
						required
					/>
				</div>

			{#if hasShipped === 'yes'}
				<div class="field">
					<label for="memberEmail">Member email</label>
					<p class="subtitle">Email of a club member who has shipped a project for your club</p>
					<input
						id="memberEmail"
						name="memberEmail"
						type="email"
						placeholder="member@example.com"
						autocomplete="email"
						value={form?.memberEmail ?? ''}
						required
					/>
				</div>
			{/if}

				<button type="submit" class="btn" disabled={isSubmitting}>
					{isSubmitting ? 'Checking...' : 'Submit'}
				</button>
			{/if}
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

	.error {
		padding: 12px 14px;
		border: 2px solid #ec3750;
		border-radius: 8px;
		background: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
		color: light-dark(#c2263d, #ff8b9b);
		font-size: 14px;
		line-height: 1.4;
		text-align: left;
		margin: 0 0 20px;
	}

	.success-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		margin-bottom: 20px;
		border-radius: 50%;
		background: #33d6a6;
	}

	.field {
		text-align: left;
		margin: 0 0 20px;
	}

	.options {
		padding: 0;
		border: 0;
	}

	.options legend {
		margin-bottom: 8px;
	}

	legend,
	.field > label {
		display: block;
		color: var(--color-text);
		font-weight: 600;
		font-size: 14px;
		margin-bottom: 6px;
	}

	.option-group {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;
		padding: 4px;
		border: 2px solid var(--color-border);
		border-radius: 10px;
		background: var(--bg-sunken);
	}

	.options .option {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		min-height: 44px;
		box-sizing: border-box;
		margin: 0;
		padding: 0 16px;
		border: 0;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text);
		font-weight: 700;
		font-size: 17px;
		line-height: 1;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.options .option:hover {
		background: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
		color: #ec3750;
	}

	.options .option.selected {
		background: #ec3750;
		color: #ffffff;
		box-shadow: 0 1px 3px light-dark(rgba(31, 45, 61, 0.14), rgba(0, 0, 0, 0.3));
	}

	.options .option.selected:hover {
		background: #d63349;
		color: #ffffff;
	}

	.options .option:focus-within {
		outline: 2px solid #ec3750;
		outline-offset: -2px;
	}

	.option input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		opacity: 0;
	}

	.subtitle {
		color: var(--color-muted);
		font-size: 13px;
		line-height: 1.4;
		margin: 0 0 8px;
	}

	.field > input {
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

	.field > input:focus {
		outline: none;
		border-color: #ec3750;
	}

	.btn {
		display: inline-block;
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		text-align: center;
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

	.btn:hover {
		opacity: 0.9;
	}

	.btn:disabled {
		cursor: wait;
		opacity: 0.65;
	}
</style>
