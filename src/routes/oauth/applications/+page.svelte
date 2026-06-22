<script>
	let { data, form } = $props();

	const defaultScopes = ['leader:read', 'clubs:read'];

	function hasScope(scopeList, scopeName) {
		return Array.isArray(scopeList) && scopeList.includes(scopeName);
	}

	function scopeLabel(scope) {
		return scope.sensitive ? `${scope.name} (verified app only)` : scope.name;
	}
</script>

<svelte:head>
	<title>OAuth Applications - Club Leaders Portal</title>
</svelte:head>

<div class="oauth-apps-page">
	<header class="page-header">
		<div>
			<h1>OAuth Applications</h1>
			<p>Register and manage your OAuth2 apps here</p>
		</div>
		<a class="back-link" href="/settings">Back to settings</a>
	</header>

	{#if form?.createError}
		<p class="message error">{form.createError}</p>
	{/if}
	{#if form?.updateError}
		<p class="message error">{form.updateError}</p>
	{/if}
	{#if form?.rotateError}
		<p class="message error">{form.rotateError}</p>
	{/if}
	{#if form?.deleteError}
		<p class="message error">{form.deleteError}</p>
	{/if}

	{#if form?.created}
		<div class="message success">
			<strong>Application created.</strong>
			<div>Client ID: <code>{form.clientId}</code></div>
			{#if form.clientSecret}
				<div>Client Secret: <code>{form.clientSecret}</code></div>
				<div class="warning">Copy this secret now. It cannot be shown again.</div>
			{/if}
		</div>
	{/if}

	{#if form?.rotated}
		<div class="message success">
			<strong>Client secret rotated.</strong>
			<div>New secret: <code>{form.clientSecret}</code></div>
			<div class="warning">Copy this secret now. It cannot be shown again.</div>
		</div>
	{/if}

	<section class="card">
		<h2>Create new OAuth app</h2>
		<form method="POST" action="?/create" class="app-form">
			<label>
				<span>App name</span>
				<input name="name" required maxlength="120" placeholder="My integration" />
			</label>

			<label>
				<span>Description</span>
				<textarea name="description" rows="2" placeholder="What your integration does"></textarea>
			</label>

			<label>
				<span>Redirect URIs (one per line)</span>
				<textarea
					name="redirectUris"
					rows="3"
					required
					placeholder="https://example.com/oauth/callback"
				></textarea>
			</label>

			<label class="checkbox">
				<input type="checkbox" name="confidential" checked />
				<span>Confidential client (requires client secret)</span>
			</label>

			<div>
				<p class="subheading">Scopes</p>
				<div class="scope-grid">
					{#each data.scopes as scope}
						<label class="scope-item {scope.sensitive ? 'sensitive disabled' : ''}">
							<input
								type="checkbox"
								name="scopes"
								value={scope.name}
								checked={defaultScopes.includes(scope.name)}
								disabled={scope.sensitive}
							/>
							<div>
								<div class="scope-name">{scopeLabel(scope)}</div>
								<div class="scope-description">{scope.description}</div>
							</div>
						</label>
					{/each}
				</div>
			</div>

			<button type="submit" class="btn">Create application</button>
		</form>
	</section>

	<section class="card">
		<h2>Your OAuth apps</h2>
		{#if data.apps.length === 0}
			<p class="empty">No apps yet.</p>
		{:else}
			<div class="apps-list">
				{#each data.apps as app}
					<article class="app-item">
						<div class="app-meta">
							<h3>{app.name}</h3>
							<div class="badges">
								<span class="badge {app.verified ? 'verified' : 'unverified'}">
									{app.verified ? 'Verified' : 'Unverified'}
								</span>
								<span class="badge type">{app.confidential ? 'Confidential' : 'Public'}</span>
							</div>
							<p class="client-id">Client ID: <code>{app.client_id}</code></p>
							{#if app.description}
								<p class="description">{app.description}</p>
							{/if}
						</div>

						<form method="POST" action="?/update" class="app-form compact">
							<input type="hidden" name="applicationId" value={app.id} />

							<label>
								<span>App name</span>
								<input name="name" value={app.name} required maxlength="120" />
							</label>

							<label>
								<span>Description</span>
								<textarea name="description" rows="2">{app.description || ''}</textarea>
							</label>

							<label>
								<span>Redirect URIs (one per line)</span>
								<textarea name="redirectUris" rows="3" required>{app.redirectUris.join('\n')}</textarea>
							</label>

							<label class="checkbox">
								<input type="checkbox" name="confidential" checked={app.confidential} />
								<span>Confidential client</span>
							</label>

							<div>
								<p class="subheading">Scopes</p>
								<div class="scope-grid">
									{#each data.scopes as scope}
										<label class="scope-item {scope.sensitive ? 'sensitive disabled' : ''}">
											<input
												type="checkbox"
												name="scopes"
												value={scope.name}
												checked={hasScope(app.scopeList, scope.name)}
												disabled={scope.sensitive && !app.verified}
											/>
											<div>
												<div class="scope-name">{scopeLabel(scope)}</div>
												<div class="scope-description">{scope.description}</div>
											</div>
										</label>
									{/each}
								</div>
							</div>

							<div class="actions">
								<button type="submit" class="btn secondary">Save changes</button>
							</div>
						</form>

						<div class="app-actions">
							{#if app.confidential}
								<form method="POST" action="?/rotateSecret">
									<input type="hidden" name="applicationId" value={app.id} />
									<button type="submit" class="btn tertiary">Rotate client secret</button>
								</form>
							{/if}

							<form method="POST" action="?/delete" onsubmit={(e) => {
								if (!confirm('Delete this OAuth app and revoke issued tokens?')) {
									e.preventDefault();
								}
							}}>
								<input type="hidden" name="applicationId" value={app.id} />
								<button type="submit" class="btn danger">Delete app</button>
							</form>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	<section class="card">
		<h2>API Reference</h2>
		<p class="api-intro">All endpoints require a Bearer token in the <code>Authorization</code> header.</p>

		<div class="api-endpoints">
			<div class="api-endpoint">
				<div class="api-method get">GET</div>
				<div class="api-details">
					<code>/api/oauth/me</code>
					<span class="api-scope">leader:read</span>
					<p>Returns the authenticated leader's identity (name, email, Slack ID).</p>
				</div>
			</div>

			<div class="api-endpoint">
				<div class="api-method get">GET</div>
				<div class="api-details">
					<code>/api/oauth/clubs</code>
					<span class="api-scope">clubs:read</span>
					<p>Lists all clubs the leader has access to, including metadata, ships, and level.</p>
				</div>
			</div>

			<div class="api-endpoint">
				<div class="api-method post">POST</div>
				<div class="api-details">
					<code>/api/oauth/clubs/:club/members</code>
					<span class="api-scope">clubs:members:write</span>
					<p>Add a member. Body: <code>{'{"name": "...", "email": "..."}'}</code></p>
				</div>
			</div>

			<div class="api-endpoint">
				<div class="api-method delete">DELETE</div>
				<div class="api-details">
					<code>/api/oauth/clubs/:club/members</code>
					<span class="api-scope">clubs:members:write</span>
					<p>Remove a member. Body: <code>{'{"memberName": "..."}'}</code></p>
				</div>
			</div>

			<div class="api-endpoint">
				<div class="api-method post">POST</div>
				<div class="api-details">
					<code>/api/oauth/clubs/:club/announce</code>
					<span class="api-scope">clubs:announce</span>
					<p>Send an announcement. Body: <code>{'{"message": "..."}'}</code> (max 1000 chars)</p>
				</div>
			</div>
		</div>

		<div class="api-auth-flow">
			<h3>Auth Flow</h3>
			<ol>
				<li>Redirect user to <code>/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=...</code></li>
				<li>User approves &rarr; redirected back with <code>?code=...</code></li>
				<li>Exchange code at <code>POST /oauth/token</code> with <code>grant_type=authorization_code</code></li>
				<li>Use the returned <code>access_token</code> as <code>Bearer</code> token</li>
			</ol>
		</div>
	</section>
</div>

<style>
	.oauth-apps-page {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1rem 3rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		color: var(--color-text);
	}

	.page-header p {
		margin-top: 0.5rem;
		color: var(--color-muted);
	}

	.back-link {
		color: #338eda;
		text-decoration: none;
		font-weight: 600;
		padding-top: 0.5rem;
	}

	.card {
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1rem;
	}

	h2 {
		margin-top: 0;
		color: var(--color-text);
	}

	.message {
		border-radius: 10px;
		padding: 0.875rem 1rem;
		margin-bottom: 1rem;
	}

	.message.success {
		background: light-dark(#e8faf4, rgba(51, 214, 166, 0.16));
		color: light-dark(#1b7f63, #5be0b0);
		border: 1px solid light-dark(#9fe7d1, rgba(51, 214, 166, 0.4));
	}

	.message.error {
		background: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
		color: light-dark(#b42334, #ff8a9c);
		border: 1px solid light-dark(#fecdd6, rgba(236, 55, 80, 0.4));
	}

	.warning {
		font-size: 0.85rem;
		margin-top: 0.4rem;
		font-weight: 600;
	}

	.app-form {
		display: grid;
		gap: 0.8rem;
	}

	.app-form label {
		display: grid;
		gap: 0.35rem;
	}

	.app-form span {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-muted);
	}

	input,
	textarea {
		padding: 0.6rem 0.75rem;
		border-radius: 8px;
		border: 2px solid var(--color-border);
		font: inherit;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #338eda;
	}

	.checkbox {
		display: flex !important;
		align-items: center;
		gap: 0.5rem;
	}

	.checkbox input {
		width: auto;
		margin: 0;
	}

	.scope-grid {
		display: grid;
		gap: 0.5rem;
	}

	.scope-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: start;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.5rem;
	}

	.scope-item.sensitive {
		border-color: light-dark(#fbbf24, rgba(241, 196, 15, 0.45));
		background: light-dark(#fffdf6, rgba(241, 196, 15, 0.16));
	}

	.scope-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.scope-item.disabled input {
		cursor: not-allowed;
	}

	.scope-name {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-text);
	}

	.scope-description {
		font-size: 0.8rem;
		color: var(--color-muted);
	}

	.subheading {
		margin: 0 0 0.35rem;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.btn {
		border: 0;
		border-radius: 8px;
		background: #ec3750;
		color: #fff;
		font-weight: 700;
		padding: 0.55rem 0.9rem;
		cursor: pointer;
	}

	.btn.secondary {
		background: #338eda;
	}

	.btn.tertiary {
		background: #1f2d3d;
	}

	.btn.danger {
		background: #b42334;
	}

	.apps-list {
		display: grid;
		gap: 1rem;
	}

	.app-item {
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;
	}

	.app-meta h3 {
		margin: 0;
		color: var(--color-text);
	}

	.badges {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.35rem;
		margin-bottom: 0.35rem;
	}

	.badge {
		font-size: 0.75rem;
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

	.badge.type {
		background: var(--bg-sunken);
		color: var(--color-muted);
	}

	.client-id,
	.description {
		font-size: 0.85rem;
		color: var(--color-muted);
		margin: 0.4rem 0;
	}

	code {
		background: var(--bg-sunken);
		padding: 0.1rem 0.3rem;
		border-radius: 4px;
	}

	.actions {
		display: flex;
		justify-content: flex-start;
	}

	.app-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.8rem;
		flex-wrap: wrap;
	}

	.empty {
		color: var(--color-muted);
		font-style: italic;
	}

	.api-intro {
		color: var(--color-muted);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.api-endpoints {
		display: grid;
		gap: 0.5rem;
	}

	.api-endpoint {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem;
		align-items: start;
		padding: 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.api-method {
		font-size: 0.7rem;
		font-weight: 800;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		text-align: center;
		min-width: 48px;
	}

	.api-method.get { background: light-dark(#dbeafe, rgba(51, 142, 218, 0.18)); color: light-dark(#1d4ed8, #8cc2f0); }
	.api-method.post { background: light-dark(#d1fae5, rgba(51, 214, 166, 0.16)); color: light-dark(#065f46, #5be0b0); }
	.api-method.delete { background: light-dark(#fee2e2, rgba(236, 55, 80, 0.16)); color: light-dark(#991b1b, #ff8a9c); }

	.api-details code {
		font-size: 0.85rem;
	}

	.api-details p {
		margin: 0.2rem 0 0;
		font-size: 0.8rem;
		color: var(--color-muted);
	}

	.api-scope {
		font-size: 0.7rem;
		background: var(--bg-sunken);
		color: var(--color-muted);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		margin-left: 0.4rem;
		font-weight: 600;
	}

	.api-auth-flow {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.api-auth-flow h3 {
		margin: 0 0 0.5rem;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.api-auth-flow ol {
		margin: 0;
		padding-left: 1.2rem;
		font-size: 0.85rem;
		color: var(--color-muted);
		line-height: 1.7;
	}

	.api-auth-flow code {
		font-size: 0.8rem;
	}
</style>
