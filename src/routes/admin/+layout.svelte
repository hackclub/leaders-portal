<script>
	import { page } from '$app/stores';
	let { children } = $props();
	
	const navItems = [
		{ href: '/admin', label: 'Overview', icon: 'grid' },
		{ href: '/admin/users', label: 'Users', icon: 'users' },
		{ href: '/admin/clubs', label: 'Clubs', icon: 'home' },
		{ href: '/admin/analytics', label: 'Analytics', icon: 'chart' }
	];
</script>

<div class="admin-layout">
	<nav class="admin-nav">
		<div class="nav-container">
			<a href="/admin" class="nav-brand">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="7" height="7"/>
					<rect x="14" y="3" width="7" height="7"/>
					<rect x="14" y="14" width="7" height="7"/>
					<rect x="3" y="14" width="7" height="7"/>
				</svg>
				Admin
			</a>
			
			<div class="nav-links">
				<a href="/admin" class="nav-link" class:active={$page.url.pathname === '/admin'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="7" height="7"/>
						<rect x="14" y="3" width="7" height="7"/>
						<rect x="14" y="14" width="7" height="7"/>
						<rect x="3" y="14" width="7" height="7"/>
					</svg>
					Overview
				</a>
				<a href="/admin/users" class="nav-link" class:active={$page.url.pathname.startsWith('/admin/users')}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					Users
				</a>
				<a href="/admin/clubs" class="nav-link" class:active={$page.url.pathname.startsWith('/admin/clubs')}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
					Clubs
				</a>
				<a href="/admin/analytics" class="nav-link" class:active={$page.url.pathname.startsWith('/admin/analytics')}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="20" x2="18" y2="10"/>
						<line x1="12" y1="20" x2="12" y2="4"/>
						<line x1="6" y1="20" x2="6" y2="14"/>
					</svg>
					Analytics
				</a>
			</div>
			
			<a href="/" class="nav-link back-link">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="19" y1="12" x2="5" y2="12"/>
					<polyline points="12 19 5 12 12 5"/>
				</svg>
				Back to Site
			</a>
		</div>
	</nav>

	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	.admin-layout {
		min-height: 100vh;
		background: #f9fafc;
	}
	
	.admin-nav {
		background: white;
		border-bottom: 1px solid #e0e6ed;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 32px;
		height: 60px;
		display: flex;
		align-items: center;
		gap: 32px;
	}
	
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 1rem;
		font-weight: 700;
		color: #1f2d3d;
		text-decoration: none;
	}
	
	.nav-brand svg {
		color: #ec3750;
	}
	
	.nav-links {
		display: flex;
		gap: 4px;
		flex: 1;
	}
	
	.nav-link {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #8492a6;
		text-decoration: none;
		border-radius: 8px;
		transition: all 150ms ease;
	}
	
	.nav-link:hover {
		color: #1f2d3d;
		background: #f9fafc;
	}
	
	.nav-link.active {
		color: #ec3750;
		background: #fef3f2;
	}
	
	.nav-link.active svg {
		color: #ec3750;
	}
	
	.back-link {
		margin-left: auto;
		color: #338eda;
	}
	
	.back-link:hover {
		color: #1f2d3d;
		background: #f9fafc;
	}
	
	.admin-main {
		min-height: calc(100vh - 60px);
	}
	
	@media (max-width: 768px) {
		.nav-container {
			padding: 0 16px;
			gap: 16px;
		}
		
		.nav-links {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
		
		.nav-link {
			white-space: nowrap;
		}
		
		.nav-link span {
			display: none;
		}
	}
</style>
