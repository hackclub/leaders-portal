<script>
	let { data } = $props();

	const tools = [
		{
			title: 'Meeting Posters',
			description: 'Generate beautiful posters for your club meetings with custom dates and themes',
			icon: 'image',
			href: '/posters',
			color: '#ec3750'
		},
		{
			title: 'Invite Code',
			description: 'Share your club\'s unique invite code with new members to join',
			icon: 'user-plus',
			href: '/my-club',
			color: '#338eda'
		},
		{
			title: 'Announcements',
			description: 'Send announcements and updates to all your club members',
			icon: 'megaphone',
			href: '/my-club',
			color: '#f59e0b'
		},
		{
			title: 'Sticker Library',
			description: 'Look at all of the cool stickers we offer!',
			icon: 'package',
			href: 'https://hackclub.com/stickers/',
			external: true,
			color: '#8b5cf6'
		},
		{
			title: 'Workshop Library',
			description: 'Browse hundreds of workshops and project ideas for your club meetings',
			icon: 'book-open',
			href: 'https://workshops.hackclub.com/',
			external: true,
			color: '#33d6a6'
		},
		{
			title: 'Slack Channel',
			description: 'Connect with other leaders in the #leaders channel on Slack',
			icon: 'message-circle',
			href: 'https://hackclub.slack.com/archives/leaders',
			external: true,
			color: '#ec3750'
		}
	];
</script>

<svelte:head>
	<title>Tools | Hack Club</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<div class="header-content">
			<div class="header-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
				</svg>
			</div>
			<div>
				<h1>Leader Tools</h1>
				<p>Resources and utilities to help run your club</p>
			</div>
		</div>
	</header>

	<div class="page-content">
		<div class="tools-grid">
			{#each tools as tool}
				<a 
					href={tool.href} 
					class="tool-card"
					target={tool.external ? '_blank' : undefined}
					rel={tool.external ? 'noopener noreferrer' : undefined}
				>
					<div class="tool-icon" style="background-color: {tool.color}15; color: {tool.color}">
						{#if tool.icon === 'image'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
								<circle cx="8.5" cy="8.5" r="1.5"/>
								<polyline points="21,15 16,10 5,21"/>
							</svg>
						{:else if tool.icon === 'user-plus'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
								<circle cx="8.5" cy="7" r="4"/>
								<line x1="20" y1="8" x2="20" y2="14"/>
								<line x1="23" y1="11" x2="17" y2="11"/>
							</svg>
						{:else if tool.icon === 'megaphone'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="m3 11 18-5v12L3 13v-2z"/>
								<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
							</svg>
						{:else if tool.icon === 'package'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
								<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
								<polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
								<line x1="12" y1="22.08" x2="12" y2="12"/>
							</svg>
						{:else if tool.icon === 'book-open'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
								<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
							</svg>
						{:else if tool.icon === 'message-circle'}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
							</svg>
						{/if}
					</div>
					<div class="tool-info">
						<h3>
							{tool.title}
							{#if tool.external}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
									<polyline points="15,3 21,3 21,9"/>
									<line x1="10" y1="14" x2="21" y2="3"/>
								</svg>
							{/if}
						</h3>
						<p>{tool.description}</p>
					</div>
					<div class="tool-arrow">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="9,18 15,12 9,6"/>
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- GitHub Student Developer Pack Section -->
		<section class="github-pack-section">
			<div class="github-pack-card">
				<div class="github-pack-header">
					<div class="github-logo">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
					</div>
					<div class="partner-badge">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
						Partner Program
					</div>
				</div>
				<div class="github-pack-content">
					<h2>GitHub Student Developer Pack</h2>
					<p class="github-pack-intro">
						With our partner, <strong>GitHub</strong>, you can unlock amazing free tools and services worth over $200,000!
					</p>
					
					<div class="perks-grid">
						<div class="perk">
							<div class="perk-icon" style="background: #2ea44f15; color: #2ea44f;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
									<polyline points="22 4 12 14.01 9 11.01"/>
								</svg>
							</div>
							<div>
								<strong>GitHub Copilot</strong>
								<span>AI pair programmer for free</span>
							</div>
						</div>
						<div class="perk">
							<div class="perk-icon" style="background: #6e549415; color: #6e5494;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2L2 7l10 5 10-5-10-5z"/>
									<path d="M2 17l10 5 10-5"/>
									<path d="M2 12l10 5 10-5"/>
								</svg>
							</div>
							<div>
								<strong>GitHub Pro</strong>
								<span>Unlimited repos & Actions mins</span>
							</div>
						</div>
						<div class="perk">
							<div class="perk-icon" style="background: #0080ff15; color: #0080ff;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="16 18 22 12 16 6"/>
									<polyline points="8 6 2 12 8 18"/>
								</svg>
							</div>
							<div>
								<strong>JetBrains IDEs</strong>
								<span>Professional development tools</span>
							</div>
						</div>
						<div class="perk">
							<div class="perk-icon" style="background: #f4811115; color: #f48111;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="10"/>
									<path d="M2 12h20"/>
									<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
								</svg>
							</div>
							<div>
								<strong>Domain Names</strong>
								<span>Free .tech, .me domains & more</span>
							</div>
						</div>
						<div class="perk">
							<div class="perk-icon" style="background: #4353ff15; color: #4353ff;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
								</svg>
							</div>
							<div>
								<strong>Cloud Credits</strong>
								<span>Azure, DigitalOcean, & more</span>
							</div>
						</div>
						<div class="perk">
							<div class="perk-icon" style="background: #7c3aed15; color: #7c3aed;">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2L2 7l10 5 10-5-10-5z"/>
									<path d="M2 17l10 5 10-5"/>
									<path d="M2 12l10 5 10-5"/>
								</svg>
							</div>
							<div>
								<strong>100+ More Tools</strong>
								<span>Design, dev, & learning tools</span>
							</div>
						</div>
					</div>

					<div class="github-pack-guide">
						<h3>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
								<line x1="12" y1="17" x2="12.01" y2="17"/>
							</svg>
							How to Get It
						</h3>
						<ol>
							<li><strong>Verify you're a student</strong> — You'll need proof of enrollment (school email, ID, transcript, etc.)</li>
							<li><strong>Create a GitHub account</strong> — Or sign in if you already have one</li>
							<li><strong>Apply for the pack</strong> — Fill out the application with your student info</li>
							<li><strong>Wait for approval</strong> — Usually takes a few days, sometimes instant!</li>
						</ol>
					</div>

					<a href="https://education.github.com/pack" target="_blank" rel="noopener noreferrer" class="github-pack-btn">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
						Get the Student Developer Pack
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
							<polyline points="15,3 21,3 21,9"/>
							<line x1="10" y1="14" x2="21" y2="3"/>
						</svg>
					</a>
				</div>
			</div>
		</section>

		<section class="resources-section">
			<h2>More Resources</h2>
			<div class="resources-grid">
				<a href="https://toolbox.hackclub.com/" target="_blank" rel="noopener noreferrer" class="resource-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
					</svg>
					<span>Hack Club Toolbox</span>
				</a>
				<a href="https://hackclub.com/brand/" target="_blank" rel="noopener noreferrer" class="resource-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="13.5" cy="6.5" r=".5"/>
						<circle cx="17.5" cy="10.5" r=".5"/>
						<circle cx="8.5" cy="7.5" r=".5"/>
						<circle cx="6.5" cy="12.5" r=".5"/>
						<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
					</svg>
					<span>Brand Guidelines</span>
				</a>
				<a href="https://github.com/hackclub" target="_blank" rel="noopener noreferrer" class="resource-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
					</svg>
					<span>GitHub Organization</span>
				</a>
				<a href="https://hackclub.com/slack/" target="_blank" rel="noopener noreferrer" class="resource-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="13" y="2" width="3" height="8" rx="1.5"/>
						<path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/>
						<rect x="8" y="14" width="3" height="8" rx="1.5"/>
						<path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/>
						<rect x="14" y="13" width="8" height="3" rx="1.5"/>
						<path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/>
						<rect x="2" y="8" width="8" height="3" rx="1.5"/>
						<path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/>
					</svg>
					<span>Join Slack</span>
				</a>
			</div>
		</section>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f9fafc;
	}

	.page-header {
		background: #f59e0b;
		padding: 48px 32px;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-icon {
		width: 64px;
		height: 64px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.header-content h1 {
		margin: 0;
		font-size: 2rem;
		color: white;
	}

	.header-content p {
		margin: 6px 0 0;
		color: rgba(255, 255, 255, 0.85);
		font-size: 1.1rem;
	}

	.page-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 20px;
		margin-bottom: 48px;
	}

	.tool-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.tool-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		border-color: transparent;
	}

	.tool-icon {
		width: 52px;
		height: 52px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.tool-info {
		flex: 1;
		min-width: 0;
	}

	.tool-info h3 {
		margin: 0 0 4px;
		font-size: 1.05rem;
		color: #1f2d3d;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tool-info h3 svg {
		color: #8492a6;
	}

	.tool-info p {
		margin: 0;
		font-size: 0.9rem;
		color: #8492a6;
		line-height: 1.4;
	}

	.tool-arrow {
		color: #e0e6ed;
		transition: all 0.2s;
	}

	.tool-card:hover .tool-arrow {
		color: #ec3750;
		transform: translateX(4px);
	}

	.resources-section h2 {
		font-size: 1.25rem;
		color: #1f2d3d;
		margin: 0 0 20px;
	}

	.resources-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.resource-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 18px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 100px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		color: #3c4858;
		transition: all 0.2s;
	}

	.resource-link:hover {
		border-color: #ec3750;
		color: #ec3750;
	}

	.resource-link svg {
		opacity: 0.7;
	}

	/* GitHub Student Developer Pack Section */
	.github-pack-section {
		margin-bottom: 48px;
	}

	.github-pack-card {
		background: #0d1117;
		border-radius: 20px;
		overflow: hidden;
		color: white;
	}

	.github-pack-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.github-logo {
		color: white;
	}

	.partner-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(236, 55, 80, 0.2);
		border: 1px solid rgba(236, 55, 80, 0.3);
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 600;
		color: #ec3750;
	}

	.github-pack-content {
		padding: 24px;
	}

	.github-pack-content h2 {
		margin: 0 0 12px;
		font-size: 1.5rem;
		color: white;
	}

	.github-pack-intro {
		margin: 0 0 24px;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
	}

	.github-pack-intro strong {
		color: white;
	}

	.perks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 12px;
		margin-bottom: 24px;
	}

	.perk {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		transition: all 0.2s;
	}

	.perk:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.perk-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.perk div:last-child {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.perk strong {
		font-size: 0.9rem;
		color: white;
	}

	.perk span {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.github-pack-guide {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
	}

	.github-pack-guide h3 {
		margin: 0 0 16px;
		font-size: 1rem;
		color: white;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.github-pack-guide ol {
		margin: 0;
		padding-left: 20px;
		color: rgba(255, 255, 255, 0.7);
	}

	.github-pack-guide li {
		margin-bottom: 10px;
		line-height: 1.5;
		font-size: 0.9rem;
	}

	.github-pack-guide li:last-child {
		margin-bottom: 0;
	}

	.github-pack-guide li strong {
		color: white;
	}

	.github-pack-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 24px;
		background: #2ea44f;
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.github-pack-btn:hover {
		background: #22863a;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(46, 164, 79, 0.3);
	}

	.github-pack-btn svg:last-child {
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.page-header {
			padding: 32px 20px;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
		}

		.header-content h1 {
			font-size: 1.5rem;
		}

		.page-content {
			padding: 20px;
		}

		.tools-grid {
			grid-template-columns: 1fr;
		}

		.github-pack-header {
			flex-direction: column;
			gap: 12px;
			text-align: center;
		}

		.perks-grid {
			grid-template-columns: 1fr;
		}

		.github-pack-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
