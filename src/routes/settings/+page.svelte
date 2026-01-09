<script>
	import { page } from '$app/stores';

	let { data } = $props();

	let successMessage = $derived($page.url.searchParams.get('success'));
	let errorMessage = $derived($page.url.searchParams.get('error'));
</script>

<svelte:head>
	<title>Settings - Club Leaders Portal</title>
</svelte:head>

<div class="container">
	<div class="settings-card">
		<div class="header">
			<a href="/" class="back-link">← Back to Home</a>
			<h1 class="title">Settings</h1>
		</div>

		{#if successMessage === 'linked'}
			<div class="success-banner">
				Successfully linked your Hack Club account.
			</div>
		{/if}

		{#if errorMessage === 'already_linked'}
			<div class="error-banner">
				This Hack Club account is already linked to another user.
			</div>
		{/if}

		<section class="section">
			<h2 class="section-title">Account Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="label">Email</span>
					<span class="value">{data.user.email || 'Not set'}</span>
				</div>
				{#if data.user.firstName || data.user.lastName}
					<div class="info-item">
						<span class="label">Name</span>
						<span class="value">{data.user.firstName || ''} {data.user.lastName || ''}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="label">Login Method</span>
					<span class="value">{data.user.provider === 'hackclub_auth' ? 'Hack Club Auth' : data.user.provider === 'email' ? 'Email OTP' : data.user.provider}</span>
				</div>
			</div>
		</section>

		<section class="section">
			<h2 class="section-title">Hack Club Account</h2>
			
			{#if data.user.hackclubAuthId}
				<div class="linked-status">
					<div class="linked-badge">
						<img src="https://icons.hackclub.com/api/icons/0x16a34a/checkmark" alt="Linked" width="20" height="20" />
						Linked
					</div>
					<p class="linked-info">Your account is linked to Hack Club Auth.</p>
				</div>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">Hack Club ID</span>
						<span class="value">{data.user.hackclubAuthId}</span>
					</div>
					{#if data.user.hackclubPrimaryEmail}
						<div class="info-item">
							<span class="label">Hack Club Email</span>
							<span class="value">{data.user.hackclubPrimaryEmail}</span>
						</div>
					{/if}
					{#if data.user.hackclubSlackId}
						<div class="info-item">
							<span class="label">Slack ID</span>
							<span class="value">{data.user.hackclubSlackId}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="unlinked-status">
					<p>Link your Hack Club account to enable additional features and use your Hack Club identity for club management.</p>
					<a href="/auth/link" class="btn link-button">
						<img src="https://icons.hackclub.com/api/icons/white/github" alt="GitHub" width="20" height="20" />
						Link Hack Club Account
					</a>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	:global(body) {
		background-color: var(--white);
		color: var(--black);
		margin: 0;
		padding: 0;
	}

	.container {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 48px 16px;
		box-sizing: border-box;
	}

	.settings-card {
		background: white;
		border: 3px solid #e0e6ed;
		border-radius: 16px;
		padding: 48px;
		max-width: 600px;
		width: 100%;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		box-sizing: border-box;
	}

	.header {
		margin-bottom: 32px;
	}

	.back-link {
		color: #ec3750;
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		display: inline-block;
		margin-bottom: 16px;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.title {
		font-size: 32px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
	}

	.section {
		margin-bottom: 32px;
		padding-bottom: 32px;
		border-bottom: 1px solid #e0e6ed;
	}

	.section:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0 0 16px 0;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #f9fafc;
		border-radius: 8px;
	}

	.label {
		color: #8492a6;
		font-size: 14px;
		font-weight: 600;
	}

	.value {
		color: #1f2d3d;
		font-size: 14px;
	}

	.linked-status {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
		padding: 16px;
		background-color: #dcfce7;
		border-radius: 8px;
	}

	.linked-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #16a34a;
		font-weight: 600;
		font-size: 14px;
	}

	.linked-info {
		color: #166534;
		font-size: 14px;
		margin: 0;
	}

	.unlinked-status {
		padding: 16px;
		background-color: #f9fafc;
		border-radius: 8px;
	}

	.unlinked-status p {
		margin: 0 0 16px 0;
		color: #8492a6;
		font-size: 14px;
		line-height: 1.5;
	}

	.link-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.success-banner {
		background-color: #dcfce7;
		border: 1px solid #16a34a;
		color: #166534;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
	}

	.error-banner {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
	}
</style>
