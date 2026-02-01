<script>
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toast.js';

	let { data, form } = $props();
	let isSubmitting = $state(false);
	let hasLeft = $state(false);
	let verificationSent = $state(false);
	let verificationCode = $state('');

	$effect(() => {
		if (form?.verificationSent) {
			verificationSent = true;
			toasts.success('Verification code sent to your email');
		}
	});

	function handleRequestVerification() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.verificationSent) {
				verificationSent = true;
				toasts.success('Verification code sent to your email');
			}
			if (result.type === 'failure' || result.data?.error) {
				toasts.error(result.data?.error || 'Failed to send verification code');
			}
			isSubmitting = false;
			await update();
		};
	}

	function handleConfirmLeave() {
		isSubmitting = true;
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.success) {
				hasLeft = true;
				toasts.success(`You have left ${data.clubName}`);
			}
			if (result.type === 'failure' || result.data?.error) {
				toasts.error(result.data?.error || 'Failed to leave club');
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
		{:else if verificationSent}
			<h1>Verify Your Identity</h1>
			<p class="message">
				We've sent a verification code to <strong>{data.maskedEmail}</strong>. 
				Enter it below to confirm leaving <strong>{data.clubName}</strong>.
			</p>
			
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<form method="POST" action="?/confirmLeave" use:enhance={handleConfirmLeave}>
				<div class="verification-input">
					<input 
						type="text" 
						name="verificationCode" 
						bind:value={verificationCode}
						placeholder="Enter 6-digit code"
						maxlength="6"
						pattern="[0-9]{6}"
						inputmode="numeric"
						autocomplete="one-time-code"
						required
					/>
				</div>
				<div class="button-group">
					<button type="button" class="btn outline" onclick={() => verificationSent = false}>
						Back
					</button>
					<button type="submit" class="btn danger-btn" disabled={isSubmitting || verificationCode.length !== 6}>
						{isSubmitting ? 'Verifying...' : 'Confirm & Leave'}
					</button>
				</div>
			</form>
		{:else}
			<h1>Leave Club</h1>
			<p class="message">
				Are you sure you want to leave <strong>{data.clubName}</strong>?
			</p>
			<div class="member-info">
				<p><span class="label">Name:</span> {data.memberName}</p>
				{#if data.maskedEmail}
					<p><span class="label">Email:</span> {data.maskedEmail}</p>
				{/if}
			</div>
			
			{#if !data.hasEmail}
				<p class="warning">
					⚠️ No email is associated with this membership. Please contact club leadership to be removed.
				</p>
			{:else}
				{#if form?.error}
					<p class="error">{form.error}</p>
				{/if}

				<p class="verify-notice">
					To verify your identity, we'll send a code to your email address.
				</p>

				<form method="POST" action="?/requestVerification" use:enhance={handleRequestVerification}>
					<div class="button-group">
						<a href="/" class="btn outline">Cancel</a>
						<button type="submit" class="btn danger-btn" disabled={isSubmitting}>
							{isSubmitting ? 'Sending...' : 'Send Verification Code'}
						</button>
					</div>
				</form>
			{/if}
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
		background-color: #f9fafc;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 48px;
		max-width: 480px;
		width: 100%;
		text-align: center;
	}

	h1 {
		color: #1f2d3d;
		font-size: 28px;
		margin: 0 0 16px 0;
	}

	.message {
		color: #8492a6;
		font-size: 16px;
		margin-bottom: 24px;
	}

	.message strong {
		color: #1f2d3d;
	}

	.member-info {
		background: #f9fafc;
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 24px;
		text-align: left;
	}

	.member-info p {
		margin: 8px 0;
		color: #1f2d3d;
	}

	.label {
		color: #8492a6;
		font-weight: 600;
	}

	.verify-notice {
		color: #8492a6;
		font-size: 14px;
		margin-bottom: 20px;
		padding: 12px;
		background: #f0f4f8;
		border-radius: 8px;
	}

	.verification-input {
		margin-bottom: 24px;
	}

	.verification-input input {
		width: 100%;
		padding: 16px;
		font-size: 24px;
		text-align: center;
		letter-spacing: 8px;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-family: monospace;
	}

	.verification-input input:focus {
		outline: none;
		border-color: #ec3750;
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
		background: #fef2f2;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.warning {
		color: #f59e0b;
		background: #fffbeb;
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
