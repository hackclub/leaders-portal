<script>
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Authorize Application - Club Leaders Portal</title>
</svelte:head>

<div class="oauth-authorize">
	<div class="panel">
		<h1>Authorize application</h1>
		<p class="subtitle">
			<strong>{data.app.name}</strong> is requesting access to your Leader Portal account.
		</p>

		{#if data.app.description}
			<p class="description">{data.app.description}</p>
		{/if}

		{#if !data.app.verified}
			<div class="banner warning">
				This application is unverified. Proceed only if you trust the developer.
			</div>
		{/if}

		{#if data.blockedByVerification}
			<div class="banner danger">
				This request includes sensitive scopes. The app must be verified by an admin before you can authorize it.
			</div>
		{/if}

		{#if form?.authorizeError}
			<div class="banner danger">{form.authorizeError}</div>
		{/if}

		<section>
			<h2>Requested permissions</h2>
			<ul class="scope-list">
				{#each data.scopes as scope}
					<li class={scope.sensitive ? 'sensitive' : ''}>
						<div class="scope-name">{scope.name}</div>
						<div class="scope-description">{scope.description}</div>
					</li>
				{/each}
			</ul>
		</section>

		<div class="actions">
			<form method="POST" action="?/deny">
				<input type="hidden" name="redirect_uri" value={data.request.redirectUri} />
				<input type="hidden" name="state" value={data.request.state} />
				<button type="submit" class="btn secondary">Deny</button>
			</form>

			<form method="POST" action="?/approve">
				<input type="hidden" name="client_id" value={data.request.clientId} />
				<input type="hidden" name="redirect_uri" value={data.request.redirectUri} />
				<input type="hidden" name="response_type" value={data.request.responseType} />
				<input type="hidden" name="state" value={data.request.state} />
				<input type="hidden" name="scope" value={data.request.scope} />
				<button type="submit" class="btn" disabled={data.blockedByVerification}>Authorize</button>
			</form>
		</div>
	</div>
</div>

<style>
	.oauth-authorize {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--bg-sunken);
	}

	.panel {
		width: 100%;
		max-width: 680px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem;
	}

	h1 {
		margin: 0 0 0.6rem;
		color: var(--color-text);
	}

	.subtitle,
	.description {
		color: var(--color-muted);
	}

	.banner {
		border-radius: 10px;
		padding: 0.75rem;
		margin: 0.8rem 0;
		font-size: 0.92rem;
	}

	.banner.warning {
		background: light-dark(#fffbeb, rgba(241, 196, 15, 0.16));
		border: 1px solid light-dark(#fcd34d, rgba(241, 196, 15, 0.45));
		color: light-dark(#92400e, #f4ce6b);
	}

	.banner.danger {
		background: light-dark(#fff1f2, rgba(236, 55, 80, 0.16));
		border: 1px solid light-dark(#fecdd6, rgba(236, 55, 80, 0.4));
		color: light-dark(#be123c, #ff8a9c);
	}

	h2 {
		font-size: 1rem;
		color: var(--color-text);
	}

	.scope-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		display: grid;
		gap: 0.45rem;
	}

	.scope-list li {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.6rem;
	}

	.scope-list li.sensitive {
		border-color: light-dark(#fbbf24, rgba(241, 196, 15, 0.45));
		background: light-dark(#fffdf6, rgba(241, 196, 15, 0.16));
	}

	.scope-name {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.scope-description {
		font-size: 0.82rem;
		color: var(--color-muted);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
		margin-top: 1.2rem;
	}

	form {
		margin: 0;
	}

	.btn {
		padding: 0.6rem 1rem;
		border-radius: 8px;
		border: none;
		background: #ec3750;
		color: #fff;
		font-weight: 700;
		cursor: pointer;
	}

	.btn.secondary {
		background: #334155;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
