<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast.js';

	const errorMessages = {
		not_a_leader: 'You are not registered as a club leader. If this is a mistake, please contact us.',
		club_dormant: 'Your club is marked as Dormant. Please contact HQ to reactivate your club.',
		oauth_denied: 'OAuth login failed.',
		token_exchange_failed: 'Login failed. Please try again.',
		user_fetch_failed: 'Could not retrieve your account. Please try again.',
		no_email: 'No email found on your account.'
	};

	let email = $state('');
	let otpCode = $state('');
	let step = $state('email');
	let loading = $state(false);
	let urlError = $derived($page.url.searchParams.get('error'));
	let error = $state('');

	async function requestOTP(e) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/request-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to send OTP';
				loading = false;
				return;
			}

			step = 'otp';
			toasts.success('Code sent! Check your email');
		} catch (err) {
			error = 'Network error. Please try again.';
			toasts.error('Network error. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function verifyOTP(e) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: otpCode })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Invalid OTP code';
				loading = false;
				return;
			}

			await invalidateAll();
			goto('/my-club');
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function goBack() {
		step = 'email';
		otpCode = '';
		error = '';
	}
</script>

<svelte:head>
	<title>Email Login - Club Leaders Portal</title>
</svelte:head>


<div class="login-page">
	<div class="login-card">
		<div class="card-header">
			<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" class="logo" />
			<h1 class="title">Leader Portal</h1>
			<p class="subtitle">Sign in to manage your club</p>
		</div>

		{#if urlError}
			<div class="alert alert-error">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="15" y1="9" x2="9" y2="15"/>
					<line x1="9" y1="9" x2="15" y2="15"/>
				</svg>
				{errorMessages[urlError] || 'An error occurred. Please try again.'}
			</div>
		{/if}

		<a href="/auth/login" class="btn btn-primary btn-lg oauth-button">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
				<polyline points="10 17 15 12 10 7"/>
				<line x1="15" y1="12" x2="3" y2="12"/>
			</svg>
			Sign in with Hack Club
		</a>

		<div class="divider">
			<span>or continue with email</span>
		</div>
		
		{#if step === 'email'}
			<form onsubmit={requestOTP} class="login-form">
				<div class="form-group">
					<label for="email" class="form-label">Email Address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="your.email@example.com"
						required
						disabled={loading}
						class="input"
					/>
				</div>

				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}

				<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
					{#if loading}
						<span class="spinner-sm"></span>
						Sending...
					{:else}
						Send OTP Code
					{/if}
				</button>

				<div class="back-link">
					<a href="/" class="link">← Back to Home</a>
				</div>
			</form>
		{:else if step === 'otp'}
			<div class="alert alert-info">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
					<polyline points="22,6 12,13 2,6"/>
				</svg>
				A 6-digit code has been sent to <strong>{email}</strong>
			</div>

			<form onsubmit={verifyOTP} class="login-form">
				<div class="form-group">
					<label for="otp" class="form-label">Enter OTP Code</label>
					<input
						id="otp"
						type="text"
						bind:value={otpCode}
						placeholder="123456"
						maxlength="6"
						inputmode="numeric"
						required
						disabled={loading}
						autofocus
						class="input otp-input"
					/>
				</div>

				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}

				<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
					{#if loading}
						<span class="spinner-sm"></span>
						Verifying...
					{:else}
						Verify & Login
					{/if}
				</button>

				<div class="back-link">
					<button type="button" class="btn btn-outline" onclick={goBack} disabled={loading}>
						← Use a different email
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: url('/orpheus.jpg');
		background-size: cover;
		background-position: center;
		padding: 24px;
	}

	.login-card {
		background: white;
		border-radius: 24px;
		padding: 48px;
		max-width: 440px;
		width: 100%;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
	}

	.card-header {
		text-align: center;
		margin-bottom: 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo {
		height: 60px;
		width: auto;
		margin-bottom: 20px;
	}

	.title {
		font-size: 2rem;
		color: #1f2d3d;
		margin: 0 0 8px 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: #8492a6;
		margin: 0;
		font-size: 1rem;
	}

	.oauth-button {
		width: 100%;
		justify-content: center;
		background: #ec3750;
		box-shadow: 0 2px 8px rgba(236, 55, 80, 0.25);
	}

	.oauth-button:hover {
		background: #d12d42;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.3);
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 28px 0;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #e0e6ed;
	}

	.divider span {
		padding: 0 16px;
		color: #8492a6;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-weight: 600;
		color: #1f2d3d;
		font-size: 0.9rem;
	}

	.otp-input {
		text-align: center;
		font-size: 1.75rem;
		letter-spacing: 0.4em;
		font-weight: 700;
		padding: 16px 20px;
	}

	.login-form .btn {
		width: 100%;
		justify-content: center;
	}

	.login-form .btn-primary {
		background: #ec3750;
		box-shadow: 0 2px 8px rgba(236, 55, 80, 0.2);
	}

	.login-form .btn-primary:hover:not(:disabled) {
		background: #d12d42;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.3);
	}

	.spinner-sm {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
		margin-right: 8px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.back-link {
		text-align: center;
		margin-top: 8px;
	}

	.link {
		color: #338eda;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		transition: color 0.2s;
	}

	.link:hover {
		color: #ec3750;
	}

	.back-link .btn {
		width: 100%;
	}

	.alert {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px 18px;
		border-radius: 12px;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.alert-info {
		background: #d6eaff;
		color: #1e6bbf;
	}

	.alert-error {
		background: #fee2e6;
		color: #c41e3a;
	}

	.alert svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	@media (max-width: 480px) {
		.login-page {
			padding: 16px;
		}

		.login-card {
			padding: 32px 24px;
			border-radius: 20px;
		}

		.title {
			font-size: 1.625rem;
		}

		.logo {
			height: 48px;
		}

		.otp-input {
			font-size: 1.5rem;
			letter-spacing: 0.3em;
		}
	}
</style>
