<script>
	let { data } = $props();
	
	let totalMembers = $derived(data.clubs?.reduce((sum, club) => sum + (club.members?.length || 0), 0) || 0);
	let totalShips = $derived(data.clubs?.reduce((sum, club) => sum + (club.ships?.length || 0), 0) || 0);
</script>

<svelte:head>
	<title>Club Portal | Hack Club</title>
</svelte:head>

{#if data.user}
	<!-- LOGGED IN DASHBOARD -->
	<div class="dashboard">
		<header class="dashboard-header">
			<div class="header-content">
				<h1>Welcome back!</h1>
				<p>Here's what's happening with your clubs</p>
			</div>
		</header>

		<!-- Stats Overview -->
		<section class="stats-section">
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon clubs-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{data.clubs?.length || 0}</span>
						<span class="stat-label">{data.clubs?.length === 1 ? 'Club' : 'Clubs'}</span>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon members-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="8.5" cy="7" r="4"/>
							<line x1="20" y1="8" x2="20" y2="14"/>
							<line x1="23" y1="11" x2="17" y2="11"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{totalMembers}</span>
						<span class="stat-label">{totalMembers === 1 ? 'Member' : 'Members'}</span>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon ships-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
							<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{totalShips}</span>
						<span class="stat-label">{totalShips === 1 ? 'Ship' : 'Ships'}</span>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon events-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{data.completedEvents?.length || 0}</span>
						<span class="stat-label">Events Done</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Quick Actions -->
		<section class="quick-actions">
			<h2>Quick Actions</h2>
			<div class="actions-grid">
				<a href="/my-club" class="action-card">
					<div class="action-icon" style="background: rgba(51, 214, 166, 0.1); color: #33d6a6;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<div class="action-text">
						<span class="action-title">Manage Club</span>
						<span class="action-desc">View members and settings</span>
					</div>
					<svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"/>
					</svg>
				</a>

				<a href="/events" class="action-card">
					<div class="action-icon" style="background: rgba(51, 142, 218, 0.1); color: #338eda;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
					</div>
					<div class="action-text">
						<span class="action-title">Sponsored Events</span>
						<span class="action-desc">Find hackathons & workshops</span>
					</div>
					<svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"/>
					</svg>
				</a>

				<a href="/ysws" class="action-card">
					<div class="action-icon" style="background: rgba(236, 55, 80, 0.1); color: #ec3750;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 12 20 22 4 22 4 12"/>
							<rect x="2" y="7" width="20" height="5"/>
							<line x1="12" y1="22" x2="12" y2="7"/>
							<path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
							<path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
						</svg>
					</div>
					<div class="action-text">
						<span class="action-title">YSWS Programs</span>
						<span class="action-desc">Ship & earn free stuff</span>
					</div>
					<svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"/>
					</svg>
				</a>

				<a href="/posters" class="action-card">
					<div class="action-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
							<circle cx="8.5" cy="8.5" r="1.5"/>
							<polyline points="21,15 16,10 5,21"/>
						</svg>
					</div>
					<div class="action-text">
						<span class="action-title">Create Posters</span>
						<span class="action-desc">Design meeting posters</span>
					</div>
					<svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9,18 15,12 9,6"/>
					</svg>
				</a>
			</div>
		</section>

		<!-- My Clubs -->
		{#if data.clubs && data.clubs.length > 0}
			<section class="clubs-section">
				<h2>Your Clubs</h2>
				<div class="clubs-grid">
					{#each data.clubs as club}
						<a href="/my-club/{club.id}" class="club-card">
							<div class="club-header">
								<h3>{club.name}</h3>
								<span class="club-role {club.role}">{club.role}</span>
							</div>
							<div class="club-stats">
								<div class="club-stat">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="9" cy="7" r="4"/>
									</svg>
									<span>{club.members?.length || 0} members</span>
								</div>
								<div class="club-stat">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
									</svg>
									<span>{club.ships?.length || 0} ships</span>
								</div>
							</div>
							{#if club.location}
								<div class="club-location">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
										<circle cx="12" cy="10" r="3"/>
									</svg>
									<span>{club.location}</span>
								</div>
							{/if}
						</a>
					{/each}
				</div>
			</section>
		{:else}
			<section class="empty-section">
				<div class="empty-card">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<h3>No clubs yet</h3>
					<p>You're not leading any clubs at the moment. Start or join a club to see it here!</p>
					<a href="https://hackclub.com/clubs/" target="_blank" rel="noopener noreferrer" class="btn-primary">
						Start a Club
					</a>
				</div>
			</section>
		{/if}

		<!-- Resources -->
		<section class="resources-section">
			<h2>Resources</h2>
			<div class="resources-grid">
				<a href="https://hackclub.com/slack/" target="_blank" rel="noopener noreferrer" class="resource-card">
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
					<span>Slack</span>
				</a>
				<a href="https://workshops.hackclub.com/" target="_blank" rel="noopener noreferrer" class="resource-card">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
					</svg>
					<span>Workshops</span>
				</a>
				<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="resource-card">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
					</svg>
					<span>Leaders Guide</span>
				</a>
				<a href="https://hackclub.com/brand/" target="_blank" rel="noopener noreferrer" class="resource-card">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="13.5" cy="6.5" r=".5"/>
						<circle cx="17.5" cy="10.5" r=".5"/>
						<circle cx="8.5" cy="7.5" r=".5"/>
						<circle cx="6.5" cy="12.5" r=".5"/>
						<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
					</svg>
					<span>Brand</span>
				</a>
			</div>
		</section>
	</div>
{:else}
	<!-- LOGGED OUT LANDING PAGE -->
	<div class="landing-page">
		<!-- Navbar -->
		<nav class="landing-nav">
			<div class="nav-container">
				<a href="/" class="nav-logo">
					<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" />
					<span>Club Portal</span>
				</a>
				<div class="nav-links">
					<a href="/ysws">YSWS</a>
					<a href="/events">Events</a>
					<a href="/tools">Tools</a>
					<a href="/auth/login" class="nav-signin">Sign In</a>
				</div>
			</div>
		</nav>

		<!-- Hero Section -->
		<section class="hero">
			<div class="hero-content">
				<span class="hero-tag">For Hack Club Leaders</span>
				
				<h1>Run your club like a pro</h1>
				
				<p class="hero-description">
					Everything you need in one place—track ships, manage members, and find resources to make your club awesome.
				</p>
				
				<div class="hero-actions">
					<a href="/auth/login" class="btn btn-primary">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
							<polyline points="10 17 15 12 10 7"/>
							<line x1="15" y1="12" x2="3" y2="12"/>
						</svg>
						Sign In
					</a>
					<a href="/email-login" class="btn btn-secondary">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
							<polyline points="22,6 12,13 2,6"/>
						</svg>
						Use Email Instead
					</a>
				</div>

				<div class="hero-stats">
					<div class="hero-stat">
						<span class="stat-number">1k+</span>
						<span class="stat-text">Clubs</span>
					</div>
					<div class="hero-stat-divider"></div>
					<div class="hero-stat">
						<span class="stat-number">80K+</span>
						<span class="stat-text">Teen Hackers</span>
					</div>
					<div class="hero-stat-divider"></div>
					<div class="hero-stat">
						<span class="stat-number">40+</span>
						<span class="stat-text">Countries</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Bento Grid -->
		<section class="bento-section">
			<div class="container">
				<div class="section-header">
					<span class="section-tag">Features</span>
					<h2>Everything you need</h2>
					<p>Tools built by club leaders, for club leaders</p>
				</div>

				<div class="bento-grid">
					<a href="/ysws" class="bento-card bento-large bento-ysws">
						<div class="bento-bg"></div>
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
									<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
								</svg>
							</div>
							<h3>YSWS Programs</h3>
							<p>Ship projects and get free hardware, swag, and other cool stuff. See what your club members are working on.</p>
							<div class="bento-cta">
								Browse Programs
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/events" class="bento-card bento-events">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
							</div>
							<h3>Events & Hackathons</h3>
							<p>Find events happening near you</p>
							<div class="bento-cta">
								See Events
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/my-club" class="bento-card bento-members">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
									<circle cx="9" cy="7" r="4"/>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
								</svg>
							</div>
							<h3>Manage Members</h3>
							<p>Invite, track, and grow your club</p>
							<div class="bento-cta">
								View Club
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/my-club" class="bento-card bento-announcements">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="m3 11 18-5v12L3 13v-2z"/>
									<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
								</svg>
							</div>
							<h3>Announcements</h3>
							<p>Keep members informed with updates</p>
							<div class="bento-cta">
								Send Announcement
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/my-club" class="bento-card bento-events">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
									<line x1="16" y1="2" x2="16" y2="6"/>
									<line x1="8" y1="2" x2="8" y2="6"/>
									<line x1="3" y1="10" x2="21" y2="10"/>
								</svg>
							</div>
							<h3>Club Events</h3>
							<p>Schedule and manage club meetings</p>
							<div class="bento-cta">
								View Calendar
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/posters" class="bento-card bento-posters">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
									<circle cx="8.5" cy="8.5" r="1.5"/>
									<polyline points="21,15 16,10 5,21"/>
								</svg>
							</div>
							<h3>Generate Posters</h3>
							<p>Beautiful meeting graphics in seconds</p>
							<div class="bento-cta">
								Create Poster
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>

					<a href="/tools" class="bento-card bento-tools">
						<div class="bento-content">
							<div class="bento-icon">
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
								</svg>
							</div>
							<h3>Leader Tools</h3>
							<p>GitHub Student Pack, resources & more</p>
							<div class="bento-cta">
								Explore Tools
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9,18 15,12 9,6"/>
								</svg>
							</div>
						</div>
					</a>
				</div>
			</div>
		</section>

		<!-- Resources Section -->
		<section class="resources-section">
			<div class="container">
				<div class="section-header">
					<span class="section-tag">Resources</span>
					<h2>Explore the Hack Club universe</h2>
					<p>Everything you need to succeed as a leader</p>
				</div>

				<div class="resources-grid">
					<a href="https://hackclub.com/slack/" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon slack-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="13" y="2" width="3" height="8" rx="1.5"/>
								<path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/>
								<rect x="8" y="14" width="3" height="8" rx="1.5"/>
								<path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/>
								<rect x="14" y="13" width="8" height="3" rx="1.5"/>
								<path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/>
								<rect x="2" y="8" width="8" height="3" rx="1.5"/>
								<path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>Slack Community</h4>
							<p>Join 30,000+ teen hackers</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>

					<a href="https://workshops.hackclub.com/" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon workshops-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
								<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>Workshops</h4>
							<p>Ready-to-run meeting content</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>

					<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon guide-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>Leaders Guide</h4>
							<p>Tips for running great clubs</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>

					<a href="https://hackclub.com/map" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon map-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
								<line x1="8" y1="2" x2="8" y2="18"/>
								<line x1="16" y1="6" x2="16" y2="22"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>Club Map</h4>
							<p>Find clubs around the world</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>

					<a href="https://hackclub.com/brand/" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon brand-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="13.5" cy="6.5" r=".5"/>
								<circle cx="17.5" cy="10.5" r=".5"/>
								<circle cx="8.5" cy="7.5" r=".5"/>
								<circle cx="6.5" cy="12.5" r=".5"/>
								<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>Brand Assets</h4>
							<p>Logos, colors, and fonts</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>

					<a href="https://github.com/hackclub" target="_blank" rel="noopener noreferrer" class="resource-card">
						<div class="resource-icon github-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
							</svg>
						</div>
						<div class="resource-text">
							<h4>GitHub</h4>
							<p>Open source projects</p>
						</div>
						<svg class="resource-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="7" y1="17" x2="17" y2="7"/>
							<polyline points="7,7 17,7 17,17"/>
						</svg>
					</a>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="cta-section">
			<div class="container">
				<div class="cta-card">
					<h2>Ready to lead?</h2>
					<p>Join thousands of teen hackers running clubs around the world</p>
					<div class="cta-actions">
						<a href="/auth/login" class="btn btn-white">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
								<polyline points="10 17 15 12 10 7"/>
								<line x1="15" y1="12" x2="3" y2="12"/>
							</svg>
							Sign in to get started
						</a>
						<a href="https://hackclub.com/clubs/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-white">
							Start a new club
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="landing-footer">
			<div class="container">
				<div class="footer-content">
					<div class="footer-brand">
						<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" />
						<span>Hack Club</span>
					</div>
					<p>Made with <span class="heart">♥</span> by teenagers, for teenagers</p>
					<div class="footer-links">
						<a href="https://hackclub.com" target="_blank" rel="noopener noreferrer">hackclub.com</a>
						<span>•</span>
						<a href="https://hackclub.com/slack/" target="_blank" rel="noopener noreferrer">Slack</a>
						<span>•</span>
						<a href="https://github.com/hackclub" target="_blank" rel="noopener noreferrer">GitHub</a>
					</div>
				</div>
			</div>
		</footer>
	</div>
{/if}

<style>
	/* ==================== DASHBOARD STYLES ==================== */
	.dashboard {
		padding: 32px;
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
	}

	.dashboard-header {
		margin-bottom: 32px;
		animation: fadeInUp 0.4s ease-out;
	}

	.dashboard-header h1 {
		margin: 0 0 8px;
		font-size: 1.75rem;
		color: #1f2d3d;
	}

	.dashboard-header p {
		margin: 0;
		color: #8492a6;
	}

	/* Stats */
	.stats-section {
		margin-bottom: 32px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}

	@media (max-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}

	.stat-card {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.4s ease-out both;
	}

	.stat-card:nth-child(1) { animation-delay: 0.05s; }
	.stat-card:nth-child(2) { animation-delay: 0.1s; }
	.stat-card:nth-child(3) { animation-delay: 0.15s; }
	.stat-card:nth-child(4) { animation-delay: 0.2s; }

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.3s ease;
	}

	.stat-card:hover .stat-icon {
		transform: scale(1.1);
	}

	.clubs-icon { background: rgba(51, 214, 166, 0.1); color: #33d6a6; }
	.members-icon { background: rgba(51, 142, 218, 0.1); color: #338eda; }
	.ships-icon { background: rgba(236, 55, 80, 0.1); color: #ec3750; }
	.events-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2d3d;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #8492a6;
	}

	/* Quick Actions */
	.quick-actions {
		margin-bottom: 32px;
	}

	.quick-actions h2,
	.clubs-section h2,
	.resources-section h2 {
		font-size: 1.25rem;
		color: #1f2d3d;
		margin: 0 0 16px;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	@media (max-width: 900px) {
		.actions-grid {
			grid-template-columns: 1fr;
		}
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.4s ease-out both;
	}

	.action-card:nth-child(1) { animation-delay: 0.25s; }
	.action-card:nth-child(2) { animation-delay: 0.3s; }
	.action-card:nth-child(3) { animation-delay: 0.35s; }
	.action-card:nth-child(4) { animation-delay: 0.4s; }

	.action-card:hover {
		border-color: #ec3750;
		box-shadow: 0 8px 20px rgba(236, 55, 80, 0.15);
		transform: translateY(-3px);
	}

	.action-icon {
		width: 44px;
		height: 44px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.3s ease;
	}

	.action-card:hover .action-icon {
		transform: scale(1.1) rotate(-5deg);
	}

	.action-text {
		flex: 1;
		min-width: 0;
	}

	.action-title {
		display: block;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 2px;
	}

	.action-desc {
		display: block;
		font-size: 0.875rem;
		color: #8492a6;
	}

	.action-arrow {
		color: #e0e6ed;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.action-card:hover .action-arrow {
		color: #ec3750;
		transform: translateX(4px);
	}

	/* Clubs */
	.clubs-section {
		margin-bottom: 32px;
	}

	.clubs-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	@media (max-width: 1200px) {
		.clubs-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.clubs-grid {
			grid-template-columns: 1fr;
		}
	}

	.club-card {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		padding: 20px;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeInUp 0.4s ease-out both;
	}

	.clubs-grid .club-card:nth-child(1) { animation-delay: 0.1s; }
	.clubs-grid .club-card:nth-child(2) { animation-delay: 0.15s; }
	.clubs-grid .club-card:nth-child(3) { animation-delay: 0.2s; }
	.clubs-grid .club-card:nth-child(4) { animation-delay: 0.25s; }
	.clubs-grid .club-card:nth-child(5) { animation-delay: 0.3s; }
	.clubs-grid .club-card:nth-child(6) { animation-delay: 0.35s; }

	.club-card:hover {
		border-color: #ec3750;
		box-shadow: 0 8px 24px rgba(236, 55, 80, 0.12);
		transform: translateY(-4px);
	}

	.club-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.club-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #1f2d3d;
	}

	.club-role {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 100px;
		text-transform: capitalize;
	}

	header {
		position: relative;
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		margin-top: -32px;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		color: #8492a6;
	}

	/* Empty State */
	.empty-section {
		margin-bottom: 32px;
		min-height: 500px;
		overflow: hidden;
	}

	/* Landing Nav */
	.landing-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid #e0e6ed;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: #1f2d3d;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.nav-logo img {
		width: 36px;
		height: 36px;
		border-radius: 10px;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-links a {
		padding: 10px 16px;
		color: #8492a6;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
		border-radius: 10px;
		transition: all 0.2s;
	}

	.nav-links a:hover {
		color: #1f2d3d;
		background: rgba(0, 0, 0, 0.04);
	}

	.nav-signin {
		background: #ec3750 !important;
		color: white !important;
	}

	.nav-signin:hover {
		background: #d32f44 !important;
	}

	/* Hero */
	.hero {
		position: relative;
		padding: 140px 24px 100px;
		min-height: 90vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		background: #f9fafc;
	}

	.hero-content {
		position: relative;
		max-width: 640px;
	}

	.hero-tag {
		display: inline-block;
		padding: 8px 16px;
		background: rgba(236, 55, 80, 0.1);
		border-radius: 100px;
		margin-bottom: 24px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #ec3750;
	}

	.hero h1 {
		margin: 0 0 20px;
		font-size: 3rem;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: #1f2d3d;
	}

	.hero-description {
		margin: 0 0 32px;
		font-size: 1.125rem;
		line-height: 1.6;
		color: #8492a6;
	}

	.hero-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 48px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 24px;
		border-radius: 12px;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-primary {
		background: #ec3750;
		color: white;
	}

	.btn-primary:hover {
		background: #d32f44;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.3);
	}

	.btn-secondary {
		background: white;
		color: #1f2d3d;
		border: 1px solid #e0e6ed;
	}

	.btn-secondary:hover {
		background: #f9fafc;
		border-color: #d0d6dd;
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 32px;
	}

	.hero-stat {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 1.75rem;
		font-weight: 800;
		color: #1f2d3d;
		letter-spacing: -0.02em;
	}

	.stat-text {
		display: block;
		font-size: 0.85rem;
		color: #8492a6;
		margin-top: 4px;
	}

	.hero-stat-divider {
		width: 1px;
		height: 40px;
		background: #e0e6ed;
	}

	/* Section Header */
	.section-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.section-tag {
		display: inline-block;
		padding: 6px 14px;
		background: rgba(236, 55, 80, 0.1);
		border-radius: 100px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #ec3750;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 16px;
	}

	.section-header h2 {
		margin: 0 0 12px;
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.section-header p {
		margin: 0;
		font-size: 1rem;
		color: #8492a6;
	}

	/* Bento Grid */
	.bento-section {
		padding: 80px 0;
		background: white;
	}

	.bento-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, auto);
		gap: 16px;
	}

	.bento-card {
		position: relative;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		padding: 24px;
		text-decoration: none;
		color: #1f2d3d;
		overflow: hidden;
		transition: all 0.2s;
	}

	.bento-card:hover {
		border-color: #ec3750;
		box-shadow: 0 4px 16px rgba(236, 55, 80, 0.1);
		transform: translateY(-2px);
	}

	.bento-large {
		grid-column: span 2;
		grid-row: span 2;
		padding: 32px;
	}

	.bento-bg {
		display: none;
	}

	.bento-content {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.bento-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
		transition: all 0.2s;
	}

	.bento-card:hover .bento-icon {
		transform: scale(1.05);
	}

	.bento-ysws .bento-icon { color: #ec3750; background: rgba(236, 55, 80, 0.1); }
	.bento-sponsored-events .bento-icon { color: #338eda; background: rgba(51, 142, 218, 0.1); }
	.bento-members .bento-icon { color: #33d6a6; background: rgba(51, 214, 166, 0.1); }
	.bento-announcements .bento-icon { color: #a855f7; background: rgba(168, 85, 247, 0.1); }
	.bento-events .bento-icon { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
	.bento-posters .bento-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
	.bento-tools .bento-icon { color: #14b8a6; background: rgba(20, 184, 166, 0.1); }

	.bento-card h3 {
		margin: 0 0 8px;
		font-size: 1.125rem;
		font-weight: 700;
	}

	.bento-large h3 {
		font-size: 1.25rem;
	}

	.bento-card p {
		margin: 0;
		font-size: 0.9rem;
		color: #8492a6;
		line-height: 1.5;
		flex: 1;
	}

	.bento-large p {
		font-size: 0.95rem;
		max-width: 400px;
	}

	.bento-cta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 16px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #ec3750;
		opacity: 0;
		transform: translateX(-8px);
		transition: all 0.3s;
	}

	.bento-card:hover .bento-cta {
		opacity: 1;
		transform: translateX(0);
	}

	/* Resources Section */
	.resources-section {
		padding: 80px 0;
		background: #f9fafc;
	}

	.resources-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.resource-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px 20px;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		text-decoration: none;
		color: #1f2d3d;
		transition: all 0.2s;
	}

	.resource-card:hover {
		border-color: #ec3750;
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.08);
		transform: translateY(-2px);
	}

	.resource-icon {
		width: 44px;
		height: 44px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.2s;
	}

	.resource-card:hover .resource-icon {
		transform: scale(1.05);
	}

	.slack-icon { background: rgba(236, 55, 80, 0.1); color: #ec3750; }
	.workshops-icon { background: rgba(51, 142, 218, 0.1); color: #338eda; }
	.guide-icon { background: rgba(51, 214, 166, 0.1); color: #33d6a6; }
	.map-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
	.brand-icon { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
	.github-icon { background: rgba(31, 45, 61, 0.1); color: #1f2d3d; }

	.resource-text {
		flex: 1;
		min-width: 0;
	}

	.resource-text h4 {
		margin: 0 0 4px;
		font-size: 1rem;
		font-weight: 600;
	}

	.resource-text p {
		margin: 0;
		font-size: 0.85rem;
		color: #8492a6;
	}

	.resource-arrow {
		color: #e0e6ed;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.resource-card:hover .resource-arrow {
		color: #ec3750;
		transform: translate(4px, -4px);
	}

	/* CTA Section */
	.cta-section {
		padding: 80px 0;
		background: white;
	}

	.cta-card {
		padding: 64px 40px;
		background: #ec3750;
		border-radius: 24px;
		text-align: center;
		color: white;
	}

	.cta-card h2 {
		margin: 0 0 12px;
		font-size: 2rem;
		font-weight: 800;
		color: white;
	}

	.cta-card p {
		margin: 0 0 28px;
		font-size: 1.05rem;
		color: rgba(255, 255, 255, 0.85);
	}

	.cta-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.btn-white {
		background: white;
		color: #ec3750;
	}

	.btn-white:hover {
		background: #f9fafc;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	}

	.btn-outline-white {
		background: transparent;
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.4);
	}

	.btn-outline-white:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.6);
	}

	/* Footer */
	.landing-footer {
		padding: 60px 0;
		background: #f9fafc;
		border-top: 1px solid #e0e6ed;
	}

	.footer-content {
		text-align: center;
	}

	.footer-brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.footer-brand img {
		width: 32px;
		height: 32px;
		border-radius: 8px;
	}

	.footer-brand span {
		font-weight: 700;
		font-size: 1.1rem;
		color: #1f2d3d;
	}

	.footer-content > p {
		margin: 0 0 20px;
		color: #8492a6;
	}

	.footer-content .heart {
		color: #ec3750;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
	}

	.footer-links a {
		color: #8492a6;
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: #ec3750;
	}

	.footer-links span {
		color: #e0e6ed;
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.bento-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.bento-large {
			grid-column: span 2;
			grid-row: span 1;
		}

		.floating-cards {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.landing-nav {
			padding: 12px 16px;
		}
		
		.nav-logo img {
			width: 32px;
			height: 32px;
		}
		
		.nav-logo span {
			font-size: 1rem;
		}
		
		.nav-links a:not(.nav-signin) {
			display: none;
		}
		
		.nav-signin {
			padding: 10px 16px !important;
			font-size: 0.875rem !important;
		}

		.hero {
			padding: 120px 16px 60px;
			min-height: auto;
		}

		.hero h1 {
			font-size: 2rem;
		}

		.hero-description {
			font-size: 1rem;
			padding: 0 8px;
		}

		.hero-stats {
			flex-direction: column;
			gap: 16px;
		}

		.hero-stat-divider {
			width: 60px;
			height: 1px;
		}

		.btn {
			padding: 14px 24px;
			font-size: 0.95rem;
		}

		.section-header h2 {
			font-size: 1.75rem;
		}

		.bento-section, .resources-section {
			padding: 60px 0;
		}

		.bento-grid {
			grid-template-columns: 1fr;
		}

		.bento-large {
			grid-column: span 1;
		}

		.resources-grid {
			grid-template-columns: 1fr;
		}

		.cta-card {
			padding: 60px 24px;
			border-radius: 24px;
		}

		.cta-content h2 {
			font-size: 1.75rem;
		}

		.cta-actions {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
