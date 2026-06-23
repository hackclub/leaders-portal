<script>
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/ThemeToggle.svelte';

	let { user = null } = $props();

	let path = $derived($page.url.pathname);
	let menuOpen = $state(false);

	function isActive(href) {
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<nav class="site-nav">
	<div class="nav-inner">
		<a href="/" class="brand" onclick={closeMenu}>Club Portal</a>

		<div class="nav-right">
			<ThemeToggle />

			<button
				class="menu-toggle"
				aria-label="Toggle navigation"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>

			<div class="nav-links" class:open={menuOpen}>
			{#if user && user.provider === 'member'}
				<a href="/members" class="nav-link" class:active={path === '/members'} onclick={closeMenu}>Home</a>
				<a href="/members/dashboard" class="nav-link" class:active={isActive('/members/dashboard')} onclick={closeMenu}>Dashboard</a>
				<form method="POST" action="/logout" class="logout-form">
					<button type="submit" class="nav-cta secondary">Logout</button>
				</form>
			{:else if user}
				<a href="/" class="nav-link" class:active={isActive('/')} onclick={closeMenu}>Home</a>
				<a href="/my-club" class="nav-link" class:active={isActive('/my-club')} onclick={closeMenu}>My Club</a>
				<a href="/settings" class="nav-link" class:active={isActive('/settings')} onclick={closeMenu}>Settings</a>
				{#if user.isAdmin}
					<a href="/admin" class="nav-link" class:active={isActive('/admin')} onclick={closeMenu}>Admin</a>
				{/if}
				<form method="POST" action="/logout" class="logout-form">
					<button type="submit" class="nav-cta secondary">Logout</button>
				</form>
			{:else}
				<a href="/" class="nav-link" class:active={isActive('/')} onclick={closeMenu}>Home</a>
				<a href="/auth/login" class="nav-cta" onclick={closeMenu}>Sign in</a>
				<a href="/email-login" class="nav-link" class:active={isActive('/email-login')} onclick={closeMenu}>Email login</a>
			{/if}
			</div>
		</div>
	</div>
</nav>

<style>
	.site-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg-card);
		border-bottom: 1px solid var(--color-border);
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.nav-inner {
		max-width: 1024px;
		margin: 0 auto;
		padding: 0 16px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		font-size: 20px;
		font-weight: 700;
		color: #ec3750;
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nav-link {
		padding: 8px 14px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
	}

	.nav-link:hover {
		background: var(--bg-sunken);
	}

	.nav-link.active {
		color: #ec3750;
		background: rgba(236, 55, 80, 0.12);
	}

	.nav-cta {
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
		border: 1px solid #ec3750;
		background: #ec3750;
		color: #ffffff;
		cursor: pointer;
		font-family: inherit;
	}

	.nav-cta:hover {
		background: #d63349;
		border-color: #d63349;
	}

	.nav-cta.secondary {
		background: var(--bg-card);
		color: #ec3750;
	}

	.nav-cta.secondary:hover {
		background: rgba(236, 55, 80, 0.12);
	}

	.logout-form {
		display: inline;
		margin: 0;
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		padding: 6px;
	}

	@media (max-width: 640px) {
		.menu-toggle {
			display: inline-flex;
		}

		.nav-links {
			display: none;
			position: absolute;
			top: 60px;
			right: 12px;
			flex-direction: column;
			align-items: stretch;
			width: 220px;
			padding: 8px;
			background: var(--bg-card);
			border: 1px solid var(--color-border);
			border-radius: 12px;
		}

		.nav-links.open {
			display: flex;
		}

		.nav-links :global(*) {
			width: 100%;
			text-align: left;
		}

		.nav-cta {
			text-align: center;
		}
	}
</style>
