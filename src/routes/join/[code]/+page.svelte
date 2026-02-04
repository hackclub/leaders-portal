<script>
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	let isJoining = $state(false);
</script>

<svelte:head>
	<title>Join {data.clubName} | Hack Club</title>
</svelte:head>

<div class="join-page">
	<div class="join-card">
		<div class="card-header">
			<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" class="logo" />
			<h1 class="title">Join {data.clubName}</h1>
			{#if data.clubLocation}
				<p class="subtitle">{data.clubLocation}</p>
			{/if}
		</div>

		{#if form?.success}
			<div class="alert alert-success">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
					<polyline points="22 4 12 14.01 9 11.01"/>
				</svg>
				<div>
					<strong>{form.rejoined ? 'Welcome back!' : 'You\'re in!'}</strong>
					<p>You've successfully joined {data.clubName}.</p>
				</div>
			</div>
			<a href="/member/{data.code}" class="btn btn-primary btn-lg full-width">Go to Club Dashboard</a>
		{:else if form?.error}
			<div class="alert alert-error">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="15" y1="9" x2="9" y2="15"/>
					<line x1="9" y1="9" x2="15" y2="15"/>
				</svg>
				{form.error}
			</div>
		{:else if !data.isLoggedIn}
			<p class="description">To join this club, you'll need to sign in or create a Hack Club account.</p>
			<a href="/auth/login?returnTo=/join/{data.code}" class="btn btn-primary btn-lg oauth-button">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
					<polyline points="10 17 15 12 10 7"/>
					<line x1="15" y1="12" x2="3" y2="12"/>
				</svg>
				Sign in with Hack Club
			</a>
			<p class="note">Don't have an account? One will be created for you when you sign in.</p>
		{:else if data.alreadyMember && data.memberStatus === 'active'}
			<div class="alert alert-success">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
					<polyline points="22 4 12 14.01 9 11.01"/>
				</svg>
				<div>
					<strong>You're already a member</strong>
					<p>You've already joined {data.clubName}.</p>
				</div>
			</div>
			<a href="/member/{data.code}" class="btn btn-primary btn-lg full-width">Go to Club Dashboard</a>
		{:else}
			<p class="description">Signed in as <strong>{data.user?.email}</strong></p>
			<p class="description">Click the button below to join {data.clubName}. You'll be able to see club announcements and events.</p>
			<form method="POST" action="?/join" use:enhance={() => {
				isJoining = true;
				return async ({ update }) => {
					await update();
					isJoining = false;
				};
			}}>
				<button type="submit" class="btn btn-primary btn-lg" disabled={isJoining}>
					{#if isJoining}
						<span class="spinner-sm"></span>
						Joining...
					{:else}
						Join {data.clubName}
					{/if}
				</button>
			</form>
			{#if data.memberStatus === 'left' || data.memberStatus === 'removed'}
				<p class="note">You were previously a member of this club. Click join to rejoin.</p>
			{/if}
		{/if}

		<div class="back-link">
			<a href="/" class="link">Back to Home</a>
		</div>
	</div>
</div>

<style>
	.join-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: url('/orpheus.jpg');
		background-size: cover;
		background-position: center;
		padding: 24px;
	}

	.join-card {
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
		font-size: 1.75rem;
		color: #1f2d3d;
		margin: 0 0 8px 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: #8492a6;
		margin: 0;
		font-size: 1rem;
	}

	.description {
		color: #3c4858;
		text-align: center;
		margin: 0 0 16px 0;
		line-height: 1.5;
	}

	.note {
		color: #8492a6;
		font-size: 0.85rem;
		text-align: center;
		margin: 16px 0 0 0;
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

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 14px 24px;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-lg {
		padding: 16px 28px;
		font-size: 1.05rem;
	}

	.btn-primary {
		background: #ec3750;
		color: white;
		box-shadow: 0 2px 8px rgba(236, 55, 80, 0.2);
	}

	.btn-primary:hover:not(:disabled) {
		background: #d12d42;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	form {
		width: 100%;
	}

	form .btn {
		width: 100%;
	}

	.full-width {
		width: 100%;
		text-align: center;
	}

	.alert {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px 18px;
		border-radius: 12px;
		font-size: 0.9rem;
		line-height: 1.5;
		margin-bottom: 24px;
	}

	.alert svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.alert div {
		flex: 1;
	}

	.alert strong {
		display: block;
		margin-bottom: 4px;
	}

	.alert p {
		margin: 0;
	}

	.alert-success {
		background: #d4edda;
		color: #155724;
	}

	.alert-error {
		background: #fee2e6;
		color: #c41e3a;
	}

	.spinner-sm {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.back-link {
		text-align: center;
		margin-top: 24px;
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

	@media (max-width: 480px) {
		.join-page {
			padding: 16px;
		}

		.join-card {
			padding: 32px 24px;
			border-radius: 20px;
		}

		.title {
			font-size: 1.5rem;
		}

		.logo {
			height: 48px;
		}
	}
</style>
