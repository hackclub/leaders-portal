<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
		} catch (err) {
			error = 'Network error. Please try again.';
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


<div class="container">
	<div class="login-card">
		<h1 class="title">Leader Portal Login</h1>

		{#if urlError}
			<div class="error">{errorMessages[urlError] || 'An error occurred. Please try again.'}</div>
		{/if}

		<a href="/auth/login" class="btn cta hackclub-button">
			Sign in with Hack Club
		</a>

		<div class="divider">
			<span>or continue with email</span>
		</div>
		
		{#if step === 'email'}
			<form onsubmit={requestOTP}>
				<div class="form-group">
					<label for="email">Email Address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="your.email@example.com"
						required
						disabled={loading}
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button type="submit" class="btn submit-button" disabled={loading}>
					{loading ? 'Sending...' : 'Send OTP Code'}
				</button>

				<div class="back-link">
					<a href="/">Back to Home</a>
				</div>
			</form>
		{:else if step === 'otp'}
			<div class="otp-sent-message">
				A 6-digit code has been sent to <strong>{email}</strong>
			</div>

			<form onsubmit={verifyOTP}>
				<div class="form-group">
					<label for="otp">Enter OTP Code</label>
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
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button type="submit" class="btn submit-button" disabled={loading}>
					{loading ? 'Verifying...' : 'Verify & Login'}
				</button>

				<div class="back-link">
					<button type="button" class="btn outline" onclick={goBack} disabled={loading}>
						Use a different email
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
<style>
	:global(body) {
		color: var(--black);
		margin: 0;
		padding: 0;
	}

	.container {
		min-height: 100vh;
		min-width: 100%;
		display: flex;
		background: url("/orpheus.jpg") center/cover;
		align-items: center;
		justify-content: center;
		padding: 16px;
		box-sizing: border-box;
	}

	.login-card {
		background: white;
		border: 3px solid #ec3750;
		border-radius: 16px;
		padding: 48px;
		max-width: 480px;
		width: 100%;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
	}

	.title {
		font-size: 32px;
		font-weight: bold;
		color: #ec3750;
		margin: 0 0 32px 0;
		text-align: center;
	}

	.form-group {
		margin-bottom: 24px;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 8px;
		color: #1f2d3d;
		font-size: 14px;
	}

	input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 16px;
		font-family: 'Phantom Sans', sans-serif;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #ec3750;
	}

	input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	.submit-button {
		width: 100%;
	}

	.error {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
	}

	.otp-sent-message {
		background-color: #e8f4fd;
		border: 1px solid #3b82f6;
		color: #1e40af;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		text-align: center;
		font-size: 14px;
	}

	.back-link {
		margin-top: 16px;
		text-align: center;
	}

	.back-link a {
		color: var(--primary);
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
	}

	.back-link a:hover {
		text-decoration: underline;
	}

	.hackclub-button {
		width: 100%;
		justify-content: center;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 24px 0;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: #ddd;
	}

	.divider span {
		padding: 0 16px;
		color: #8492a6;
		font-size: 14px;
	}
</style>
