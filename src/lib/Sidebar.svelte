<script>
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import DarkModeToggle from './DarkModeToggle.svelte';
	
	let { user = null, clubs = [], memberClubs = [], currentPath = '/', sidebarOpen = $bindable(false) } = $props();
	
	// Check if user is a leader (has leader clubs) or just a member
	let isLeader = $derived(clubs?.length > 0);
	let isMemberOnly = $derived(!isLeader && memberClubs?.length > 0);
	
	let myClubActive = $derived(currentPath.startsWith('/my-club'));
	let myClubExpanded = $state(false);
	let membershipActive = $derived(currentPath.startsWith('/member'));
	let membershipExpanded = $state(false);
	
	$effect(() => {
		if (myClubActive) {
			myClubExpanded = true;
		}
	});

	$effect(() => {
		if (membershipActive) {
			membershipExpanded = true;
		}
	});

	function closeSidebar() {
		sidebarOpen = false;
	}

	function toggleMyClub(e) {
		e.preventDefault();
		e.stopPropagation();
		myClubExpanded = !myClubExpanded;
	}

	function toggleMemberships(e) {
		e.preventDefault();
		e.stopPropagation();
		membershipExpanded = !membershipExpanded;
	}

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'home' },
		{ href: '/events', label: 'Sponsored Events', icon: 'calendar' },
		{ href: '/tools', label: 'Tools', icon: 'wrench' },
		{ href: '/ysws', label: 'YSWS', icon: 'gift' },
		{ href: '/posters', label: 'Posters', icon: 'image' },
		{ href: '/settings', label: 'Settings', icon: 'settings' }
	];

	let membershipSubItems = $derived.by(() => {
		if (!memberClubs?.length) {
			return [
				{ href: '/member', label: 'No Memberships', icon: 'info', exact: true }
			];
		}
		return memberClubs.map(club => ({
			href: `/member/${club.club_slug}`,
			label: club.club_name,
			icon: 'club'
		}));
	});

	let myClubSubItems = $derived.by(() => {
		const firstClub = clubs?.[0];
		if (!firstClub) {
			return [
				{ href: '/my-club', label: 'Overview', icon: 'eye', exact: true },
			];
		}
		const clubPath = `/my-club/${encodeURIComponent(firstClub.name)}`;
		return [
			{ href: '/my-club', label: 'Overview', icon: 'eye', exact: true },
			{ href: `${clubPath}/members`, label: 'Members', icon: 'users-sub', pattern: '/members' },
			{ href: `${clubPath}/announcements`, label: 'Announcements', icon: 'megaphone', pattern: '/announcements' },
			{ href: `${clubPath}/events`, label: 'Club Events', icon: 'calendar-sub', pattern: '/events' },
			{ href: `${clubPath}/ships`, label: 'Ships', icon: 'rocket', pattern: '/ships' },
			{ href: `${clubPath}/levels`, label: 'Levels', icon: 'star', pattern: '/levels' },
			{ href: `${clubPath}/manage`, label: 'Manage', icon: 'cog', pattern: '/manage' },
		];
	});

	function isActive(href) {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	function isExactActive(href) {
		return currentPath === href;
	}
</script>

<!-- Mobile overlay -->
{#if sidebarOpen}
	<button class="sidebar-overlay" onclick={closeSidebar} aria-label="Close sidebar"></button>
{/if}

<aside class="sidebar" class:open={sidebarOpen}>
	<div class="sidebar-header">
		<a href="/" class="logo" onclick={closeSidebar}>
			<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" />
			<span class="logo-text">Club Portal</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		<!-- For member-only users, show My Memberships first -->
		{#if isMemberOnly}
			<!-- My Memberships section for member-only users -->
			<div class="nav-group" class:expanded={membershipExpanded}>
				<button 
					class="nav-item nav-parent" 
					class:active={membershipActive}
					onclick={toggleMemberships}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<line x1="19" y1="8" x2="19" y2="14"/>
						<line x1="22" y1="11" x2="16" y2="11"/>
					</svg>
					<span>My Memberships</span>
					<svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="6 9 12 15 18 9"/>
					</svg>
				</button>
				
				{#if membershipExpanded}
					<div class="nav-submenu" transition:slide={{ duration: 200, easing: cubicOut }}>
						{#each membershipSubItems as subItem, i}
							<a 
								href={subItem.href} 
								class="nav-subitem" 
								class:active={currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')}
								onclick={closeSidebar}
								style="animation-delay: {i * 30}ms"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
									<polyline points="9 22 9 12 15 12 15 22"/>
								</svg>
								<span>{subItem.label}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
			
			<!-- Settings for member-only users -->
			<a 
				href="/settings" 
				class="nav-item" 
				class:active={isActive('/settings')}
				onclick={closeSidebar}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
				</svg>
				<span>Settings</span>
			</a>
		{:else}
			<!-- Dashboard (leaders only) -->
			<a 
				href="/" 
				class="nav-item" 
				class:active={currentPath === '/'}
				onclick={closeSidebar}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
					<polyline points="9 22 9 12 15 12 15 22"/>
				</svg>
				<span>Dashboard</span>
			</a>

			<!-- My Club with submenu (leaders only) -->
			<div class="nav-group" class:expanded={myClubExpanded}>
				<button 
					class="nav-item nav-parent" 
					class:active={myClubActive}
					onclick={toggleMyClub}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					<span>My Club</span>
					<svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="6 9 12 15 18 9"/>
					</svg>
				</button>
				
				{#if myClubExpanded}
					<div class="nav-submenu" transition:slide={{ duration: 200, easing: cubicOut }}>
						{#each myClubSubItems as subItem, i}
							<a 
								href={subItem.href} 
								class="nav-subitem" 
								class:active={subItem.exact ? isExactActive(subItem.href) : (subItem.pattern ? currentPath.includes(subItem.pattern) : isActive(subItem.href))}
								onclick={closeSidebar}
								style="animation-delay: {i * 30}ms"
							>
								{#if subItem.icon === 'eye'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
								{:else if subItem.icon === 'users-sub'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="9" cy="7" r="4"/>
									</svg>
								{:else if subItem.icon === 'calendar-sub'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
										<line x1="16" y1="2" x2="16" y2="6"/>
										<line x1="8" y1="2" x2="8" y2="6"/>
										<line x1="3" y1="10" x2="21" y2="10"/>
									</svg>
								{:else if subItem.icon === 'megaphone'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="m3 11 18-5v12L3 13v-2z"/>
										<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
									</svg>
								{:else if subItem.icon === 'rocket'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
										<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
									</svg>
								{:else if subItem.icon === 'star'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
									</svg>
								{:else if subItem.icon === 'cog'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="3"/>
										<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
									</svg>
								{/if}
								<span>{subItem.label}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Rest of nav items (leaders only) -->
			{#each navItems as item}
				{#if item.href !== '/'}
				<a 
					href={item.href} 
					class="nav-item" 
					class:active={isActive(item.href)}
					onclick={closeSidebar}
				>
					{#if item.icon === 'home'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
							<polyline points="9 22 9 12 15 12 15 22"/>
						</svg>
					{:else if item.icon === 'users'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					{:else if item.icon === 'calendar'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
					{:else if item.icon === 'wrench'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
						</svg>
					{:else if item.icon === 'gift'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 12 20 22 4 22 4 12"/>
							<rect x="2" y="7" width="20" height="5"/>
							<line x1="12" y1="22" x2="12" y2="7"/>
							<path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
							<path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
						</svg>
					{:else if item.icon === 'image'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
							<circle cx="8.5" cy="8.5" r="1.5"/>
							<polyline points="21 15 16 10 5 21"/>
						</svg>
					{:else if item.icon === 'settings'}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="3"/>
							<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
						</svg>
					{/if}
					<span>{item.label}</span>
				</a>
				{/if}
			{/each}

			<!-- My Memberships section (for leaders who also have memberships) -->
			{#if memberClubs?.length > 0}
				<div class="nav-divider"></div>
				<div class="nav-group" class:expanded={membershipExpanded}>
					<button 
						class="nav-item nav-parent" 
						class:active={membershipActive}
						onclick={toggleMemberships}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<line x1="19" y1="8" x2="19" y2="14"/>
							<line x1="22" y1="11" x2="16" y2="11"/>
						</svg>
						<span>My Memberships</span>
						<svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="6 9 12 15 18 9"/>
						</svg>
					</button>
					
					{#if membershipExpanded}
						<div class="nav-submenu" transition:slide={{ duration: 200, easing: cubicOut }}>
							{#each membershipSubItems as subItem, i}
								<a 
									href={subItem.href} 
									class="nav-subitem" 
									class:active={currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')}
									onclick={closeSidebar}
									style="animation-delay: {i * 30}ms"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
										<polyline points="9 22 9 12 15 12 15 22"/>
									</svg>
									<span>{subItem.label}</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}

		{#if user?.isAdmin}
			<div class="nav-divider"></div>
			<a 
				href="/admin" 
				class="nav-item admin-link" 
				class:active={currentPath.startsWith('/admin')}
				onclick={closeSidebar}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
				</svg>
				<span>Admin</span>
			</a>
		{/if}
	</nav>

	<div class="sidebar-footer">
		{#if user}
			<div class="user-info">
				<div class="user-avatar">
					{user.email?.charAt(0).toUpperCase() || '?'}
				</div>
				<div class="user-details">
					<span class="user-email">{user.email}</span>
				</div>
			</div>
			<DarkModeToggle />
			<a href="/logout" class="logout-btn" title="Log out" aria-label="Log out">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
					<polyline points="16 17 21 12 16 7"/>
					<line x1="21" y1="12" x2="9" y2="12"/>
				</svg>
			</a>
		{:else}
			<a href="/auth/login" class="login-btn">Log In</a>
		{/if}
	</div>
</aside>

<style>
	.sidebar-overlay {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 199;
		border: none;
		cursor: pointer;
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: white;
		border-right: 1px solid #e0e6ed;
		display: flex;
		flex-direction: column;
		z-index: 200;
		transition: transform 0.3s ease;
	}

	.sidebar-header {
		padding: 20px;
		border-bottom: 1px solid #e0e6ed;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
	}

	.logo img {
		height: 40px;
	}

	.logo-text {
		font-family: 'Phantom Sans', system-ui, sans-serif;
		font-weight: 700;
		font-size: 1.125rem;
		color: #1f2d3d;
	}

	.sidebar-nav {
		flex: 1;
		padding: 16px 12px;
		overflow-y: auto;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 10px;
		color: #3c4858;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 4px;
		position: relative;
	}

	.nav-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%) scaleY(0);
		width: 3px;
		height: 60%;
		background: #ec3750;
		border-radius: 0 3px 3px 0;
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item:hover {
		background: #f9fafc;
		color: #ec3750;
		transform: translateX(4px);
	}

	.nav-item:hover::before {
		transform: translateY(-50%) scaleY(1);
	}

	.nav-item.active {
		background: #ec3750;
		color: white;
		transform: translateX(0);
	}

	.nav-item.active::before {
		transform: translateY(-50%) scaleY(0);
	}

	.nav-item.active svg {
		stroke: white;
	}

	.nav-item svg {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}

	.nav-item:hover svg {
		transform: scale(1.1);
	}

	.nav-item.active:hover svg {
		transform: scale(1);
	}

	/* Unique icon animations on hover */
	.nav-item[href="/"]:hover svg {
		animation: bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/events"]:hover svg {
		animation: wiggle 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/tools"]:hover svg {
		animation: rotate 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/ysws"]:hover svg {
		animation: shake 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/posters"]:hover svg {
		animation: pulse 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/settings"]:hover svg {
		animation: spin 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item[href="/admin"]:hover svg {
		animation: pulse 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Sub-nav icon animations */
	.sub-nav .nav-item:hover svg {
		animation: bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0) scale(1.1); }
		40% { transform: translateY(-4px) scale(1.1); }
		60% { transform: translateY(-2px) scale(1.1); }
	}

	@keyframes wiggle {
		0%, 100% { transform: rotate(0deg) scale(1.1); }
		20% { transform: rotate(-8deg) scale(1.1); }
		40% { transform: rotate(8deg) scale(1.1); }
		60% { transform: rotate(-4deg) scale(1.1); }
		80% { transform: rotate(4deg) scale(1.1); }
	}

	@keyframes rotate {
		0%, 100% { transform: rotate(0deg) scale(1.1); }
		50% { transform: rotate(-20deg) scale(1.15); }
	}

	@keyframes shake {
		0%, 100% { transform: rotate(0deg) scale(1.1); }
		20% { transform: rotate(-12deg) scale(1.15); }
		40% { transform: rotate(12deg) scale(1.15); }
		60% { transform: rotate(-8deg) scale(1.1); }
		80% { transform: rotate(8deg) scale(1.1); }
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1.1); }
		50% { transform: scale(1.25); }
	}

	@keyframes spin {
		0% { transform: rotate(0deg) scale(1.1); }
		100% { transform: rotate(360deg) scale(1.1); }
	}

	/* Nav parent with arrow */
	.nav-parent {
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
		font-size: inherit;
		font-family: inherit;
	}

	/* My Club icon animation */
	.nav-parent:hover > svg:first-of-type {
		animation: bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-parent span {
		flex: 1;
		text-align: left;
	}

	.arrow-icon {
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
	}

	.nav-group.expanded .arrow-icon {
		transform: rotate(180deg);
	}

	.nav-parent:hover .arrow-icon {
		transform: translateY(2px);
	}

	.nav-group.expanded .nav-parent:hover .arrow-icon {
		transform: rotate(180deg) translateY(-2px);
	}

	.nav-parent.active .arrow-icon {
		stroke: white;
	}

	/* Submenu styles */
	.nav-submenu {
		padding-left: 16px;
		margin-bottom: 4px;
		overflow: hidden;
	}

	.nav-subitem {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border-radius: 8px;
		color: #8492a6;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		margin-bottom: 2px;
		animation: slideIn 0.25s ease both;
		opacity: 1;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.nav-subitem:hover {
		background: #f9fafc;
		color: #ec3750;
		transform: translateX(4px);
	}

	.nav-subitem:hover svg {
		animation: bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-subitem svg {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-subitem.active {
		background: rgba(236, 55, 80, 0.1);
		color: #ec3750;
		border: 1.5px solid #ec3750;
		border-radius: 8px;
	}

	.nav-subitem.active svg {
		stroke: #ec3750;
	}

	.nav-divider {
		height: 1px;
		background: #e0e6ed;
		margin: 12px 16px;
	}

	/* Admin link special styling */
	.nav-item.admin-link {
		border: 2px dotted #f1c40f;
		background: rgba(241, 196, 15, 0.05);
	}

	.nav-item.admin-link:hover {
		border-color: #f1c40f;
		background: rgba(241, 196, 15, 0.1);
	}

	.nav-item.admin-link.active {
		border-color: transparent;
		background: #ec3750;
	}

	.sidebar-footer {
		padding: 16px;
		border-top: 1px solid #e0e6ed;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-info {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #ec3750;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.user-details {
		min-width: 0;
		flex: 1;
	}

	.user-email {
		display: block;
		font-size: 0.875rem;
		color: #3c4858;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		color: #8492a6;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.logout-btn svg {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.logout-btn:hover {
		background: #f9fafc;
		color: #ec3750;
	}

	.logout-btn:hover svg {
		animation: slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideOut {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(3px); }
	}

	.login-btn {
		flex: 1;
		display: block;
		text-align: center;
		padding: 10px 16px;
		background: #ec3750;
		color: white;
		border-radius: 8px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.login-btn:hover {
		background: #d32f44;
	}

	@media (max-width: 1024px) {
		.sidebar-overlay {
			display: block;
		}

		.sidebar {
			transform: translateX(-100%);
			width: 85%;
			max-width: 320px;
		}

		.sidebar.open {
			transform: translateX(0);
		}
		
		/* Larger touch targets on mobile */
		.nav-item {
			padding: 14px 16px;
			min-height: 48px;
		}
		
		.sub-nav .nav-item {
			padding: 12px 16px 12px 48px;
			min-height: 44px;
		}
	}

	@media (max-width: 480px) {
		.sidebar {
			width: 100%;
			max-width: none;
		}
		
		.sidebar-header {
			padding: 16px;
		}
		
		.logo img {
			height: 36px;
		}
		
		.logo-text {
			font-size: 1rem;
		}
		
		.nav-item {
			padding: 16px;
			font-size: 1rem;
		}
	}
</style>
