<script>
	let { data } = $props();
	let selectedProject = $state(data.projects && data.projects.length > 0 ? data.projects[0] : null);

	function selectProject(project) {
		selectedProject = project;
	}
</script>

<svelte:head>
	<title>Review Projects</title>
</svelte:head>

<div class="container">
	<header>
		<h1 class="page-title">Review Projects</h1>
		<div class="header-buttons">
			<a href="/" class="btn">Home</a>
			<form method="POST" action="/logout" style="display: inline;">
				<button type="submit" class="btn">Logout</button>
			</form>
		</div>
	</header>
	
	{#if data.error}
		<div class="error-banner">
			<p>Error: {data.error}</p>
		</div>
	{/if}

	{#if data.projects && data.projects.length > 0}
		<div class="review-layout">
			<!-- Left Sidebar: List of Projects -->
			<div class="project-list">
				{#each data.projects as project}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div 
						class="project-list-item {selectedProject?.id === project.id ? 'selected' : ''}"
						onclick={() => selectProject(project)}
					>
						<div class="item-header">
							<span class="item-name">{project.FirstName} {project.LastName}</span>
							<span class="item-date">{new Date().toLocaleDateString()}</span> <!-- Placeholder date if not in data -->
						</div>
						<div class="item-summary">
							{project.City}, {project.Country}
						</div>
					</div>
				{/each}
			</div>

			<!-- Right Content: Selected Project Details -->
			<div class="project-detail">
				{#if selectedProject}
					<div class="detail-card">
						<div class="detail-header">
							<div>
								<h2 class="detail-name">{selectedProject.FirstName} {selectedProject.LastName}</h2>
								<div class="detail-badges">
									<span class="badge pending">Pending Review</span>
								</div>
							</div>
							<div class="action-buttons">
								<button class="btn approve-btn">Approve</button>
								<button class="btn reject-btn">Reject</button>
							</div>
						</div>

						<div class="info-grid">
							<div class="info-group">
								<span class="info-label">Email</span>
								<div class="info-value">{selectedProject.Email}</div>
							</div>
							<div class="info-group">
								<span class="info-label">GitHub</span>
								<div class="info-value">
									<a href="https://github.com/{selectedProject.GitHubUsername}" target="_blank" class="text-link">
										{selectedProject.GitHubUsername}
									</a>
								</div>
							</div>
							<div class="info-group">
								<span class="info-label">Location</span>
								<div class="info-value">
									{selectedProject.AddressLine1}<br>
									{#if selectedProject.AddressLine2}{selectedProject.AddressLine2}<br>{/if}
									{selectedProject.City}, {selectedProject.StateProvince} {selectedProject.ZipPostalCode}<br>
									{selectedProject.Country}
								</div>
							</div>
							<div class="info-group">
								<span class="info-label">Birthday</span>
								<div class="info-value">{selectedProject.Birthday}</div>
							</div>
							<div class="info-group">
								<span class="info-label">Slack ID</span>
								<div class="info-value">{selectedProject.SlackID}</div>
							</div>
						</div>

						<div class="assets-section">
							<h3 class="section-title">Project Assets</h3>
							<div class="assets-grid">
								{#if selectedProject.Screenshot && selectedProject.Screenshot.length > 0}
									<div class="asset-card">
										<div class="asset-preview">
											<img src={selectedProject.Screenshot[0].url} alt="Project Screenshot" />
										</div>
										<div class="asset-info">
											<span class="asset-type">Screenshot</span>
											<a href={selectedProject.Screenshot[0].url} target="_blank" class="asset-link">View Full Size</a>
										</div>
									</div>
								{/if}
								
								{#if selectedProject.ProjectFile && selectedProject.ProjectFile.length > 0}
									<div class="asset-card file-card">
										<div class="asset-preview">
											<img src="https://icons.hackclub.com/api/icons/0x8492a6/attachment" alt="File" width="48" height="48" class="file-icon" />
										</div>
										<div class="asset-info">
											<span class="asset-type">STEP File</span>
											<span class="file-name">{selectedProject.ProjectFile[0].filename}</span>
											<a href={selectedProject.ProjectFile[0].url} target="_blank" class="asset-link">Download</a>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<div class="empty-selection">
						<p>Select a project to review</p>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<p>No pending projects to review.</p>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: var(--bg-page);
		margin: 0;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 32px 24px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		flex-shrink: 0;
	}

	.page-title {
		font-size: 32px;
		font-weight: bold;
		color: #ec3750;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
	}

	

	.error-banner {
		background-color: light-dark(#fee2e2, rgba(236, 55, 80, 0.16));
		border: 1px solid light-dark(#ef4444, rgba(236, 55, 80, 0.4));
		color: light-dark(#b91c1c, #ff8a9c);
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 16px;
	}

	/* Layout */
	.review-layout {
		display: flex;
		gap: 24px;
		flex: 1;
		min-height: 0; /* Important for nested scrolling */
	}

	/* Sidebar */
	.project-list {
		width: 300px;
		background: var(--bg-card);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.project-list-item {
		padding: 16px;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.project-list-item:hover {
		background-color: var(--bg-sunken);
	}

	.project-list-item.selected {
		background-color: light-dark(#fff1f3, rgba(236, 55, 80, 0.16));
		border-left: 4px solid #ec3750;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.item-name {
		font-weight: 600;
		color: var(--color-text);
	}

	.item-date {
		font-size: 12px;
		color: var(--color-muted);
	}

	.item-summary {
		font-size: 13px;
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Main Content */
	.project-detail {
		flex: 1;
		background: var(--bg-card);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		overflow-y: auto;
		padding: 32px;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 24px;
	}

	.detail-name {
		font-size: 28px;
		font-weight: bold;
		color: var(--color-text);
		margin: 0 0 8px 0;
	}

	.badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge.pending {
		background-color: light-dark(#fef3c7, rgba(241, 196, 15, 0.16));
		color: light-dark(#92400e, #f4ce6b);
	}

	.action-buttons {
		display: flex;
		gap: 12px;
	}

	.approve-btn {
		background-color: var(--green) !important;
		border-color: var(--green) !important;
	}

	.reject-btn {
		background-color: var(--red) !important;
		border-color: var(--red) !important;
	}

	/* Info Grid */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
		margin-bottom: 48px;
	}

	.info-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.info-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 16px;
		color: var(--color-text);
		line-height: 1.5;
	}

	.text-link {
		color: #ec3750;
		text-decoration: none;
	}

	.text-link:hover {
		text-decoration: underline;
	}

	/* Assets */
	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 16px 0;
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 24px;
	}

	.asset-card {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.asset-card:hover {
		border-color: #ec3750;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
	}

	.asset-preview {
		height: 150px;
		background-color: var(--bg-sunken);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.asset-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.file-icon {
		font-size: 48px;
	}

	.file-card .asset-preview {
		background-color: var(--bg-sunken);
	}

	.asset-info {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.asset-type {
		font-size: 11px;
		text-transform: uppercase;
		color: var(--color-muted);
		font-weight: 600;
	}

	.file-name {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.asset-link {
		font-size: 13px;
		color: #ec3750;
		text-decoration: none;
		font-weight: 500;
		margin-top: 4px;
	}

	.asset-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		padding: 64px;
		color: var(--color-muted);
		background: var(--bg-card);
		border-radius: 12px;
		border: 2px dashed var(--color-border);
		text-align: center;
	}
</style>
