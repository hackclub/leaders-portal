<script>
	let { data } = $props();

	function ownerName(owner) {
		if (!owner) return 'No owner';
		const fullName = `${owner.first_name || ''} ${owner.last_name || ''}`.trim();
		if (fullName) return fullName;
		if (owner.username) return `@${owner.username}`;
		return owner.email || 'Unknown owner';
	}
</script>

<div class="admin-oauth-apps">
	<header class="header">
		<div>
			<h1>OAuth Applications</h1>
			<p>Review and verify applications before granting access to sensitive scopes.</p>
		</div>
		<a href="/admin" class="back">Back to admin</a>
	</header>

	<div class="app-list">
		{#if data.apps.length === 0}
			<div class="empty">No OAuth applications found.</div>
		{:else}
			{#each data.apps as app}
				<article class="app-card">
					<div class="top-row">
						<div>
							<h2>{app.name}</h2>
							<div class="meta-row">
								<span class="badge {app.verified ? 'verified' : 'unverified'}">{app.verified ? 'Verified' : 'Unverified'}</span>
								<span class="badge kind">{app.confidential ? 'Confidential' : 'Public'}</span>
							</div>
						</div>
						<form method="POST" action="?/toggleVerified">
							<input type="hidden" name="applicationId" value={app.id} />
							<input type="hidden" name="verified" value={app.verified} />
							<button class="btn" type="submit">{app.verified ? 'Mark unverified' : 'Mark verified'}</button>
						</form>
					</div>

					<div class="grid">
						<div>
							<p class="label">Client ID</p>
							<code>{app.client_id}</code>
						</div>
						<div>
							<p class="label">Owner</p>
							<p>{ownerName(app.owner)}</p>
							{#if app.owner?.email}
								<p class="muted">{app.owner.email}</p>
							{/if}
						</div>
					</div>

					<div class="section">
						<p class="label">Redirect URIs</p>
						<ul>
							{#each app.redirectUris as uri}
								<li><code>{uri}</code></li>
							{/each}
						</ul>
					</div>

					<div class="section">
						<p class="label">Scopes</p>
						<div class="scope-list">
							{#each app.scopeList as scope}
								<span class="scope">{scope}</span>
							{/each}
						</div>
					</div>
				</article>
			{/each}
		{/if}
	</div>
</div>

<style>
	.admin-oauth-apps {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	h1 {
		margin: 0;
		color: var(--color-text);
	}

	.header p {
		margin-top: 0.4rem;
		color: var(--color-muted);
	}

	.back {
		color: #338eda;
		font-weight: 600;
		text-decoration: none;
	}

	.app-list {
		display: grid;
		gap: 1rem;
	}

	.empty {
		background: var(--bg-card);
		border: 2px dashed var(--color-border);
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		color: var(--color-muted);
	}

	.app-card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;
	}

	.top-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	h2 {
		margin: 0;
		color: var(--color-text);
		font-size: 1.1rem;
	}

	.meta-row {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.3rem;
	}

	.badge {
		font-size: 0.72rem;
		padding: 0.2rem 0.45rem;
		border-radius: 999px;
		font-weight: 700;
	}

	.badge.verified {
		background: light-dark(#d1fae5, rgba(51, 214, 166, 0.16));
		color: light-dark(#065f46, #5be0b0);
	}

	.badge.unverified {
		background: light-dark(#fef3c7, rgba(241, 196, 15, 0.16));
		color: light-dark(#92400e, #f4ce6b);
	}

	.badge.kind {
		background: var(--bg-sunken);
		color: var(--color-muted);
	}

	.btn {
		border: none;
		background: #ec3750;
		color: white;
		font-weight: 700;
		padding: 0.5rem 0.8rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 0.85rem;
	}

	.label {
		font-size: 0.76rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		font-weight: 700;
		color: var(--color-muted);
		margin-bottom: 0.3rem;
	}

	.muted {
		margin-top: 0.2rem;
		font-size: 0.82rem;
		color: var(--color-muted);
	}

	.section {
		margin-top: 0.8rem;
	}

	ul {
		margin: 0;
		padding-left: 1rem;
	}

	li {
		margin-bottom: 0.2rem;
	}

	code {
		background: var(--bg-sunken);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
	}

	.scope-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.scope {
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
	}

	@media (max-width: 700px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
