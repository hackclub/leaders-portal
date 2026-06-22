<script>
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/ThemeToggle.svelte';

	let { children } = $props();

	let path = $derived($page.url.pathname);

	const links = [
		{ href: '/admin', label: 'Overview' },
		{ href: '/admin/users', label: 'Users' },
		{ href: '/admin/clubs', label: 'Clubs' },
		{ href: '/admin/analytics', label: 'Analytics' },
		{ href: '/admin/oauth-apps', label: 'OAuth Apps' }
	];

	function isActive(href) {
		if (href === '/admin') return path === '/admin';
		return path === href || path.startsWith(href + '/');
	}
</script>

<div class="admin">
	<nav class="admin-nav">
		<div class="nav-inner">
			<a href="/admin" class="brand">Admin Dashboard</a>
			<div class="nav-links">
				{#each links as link}
					<a href={link.href} class="nav-link" class:active={isActive(link.href)}>{link.label}</a>
				{/each}
				<a href="/" class="nav-link back">← Back to Site</a>
				<ThemeToggle />
			</div>
		</div>
	</nav>

	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	.admin {
		min-height: 100vh;
		background: var(--bg-sunken);
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.admin-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg-card);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		height: 60px;
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.brand {
		font-size: 20px;
		font-weight: 700;
		color: #ec3750;
		text-decoration: none;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
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
		background: light-dark(#fff0f2, rgba(236, 55, 80, 0.16));
	}

	.nav-link.back {
		color: var(--color-muted);
		margin-left: auto;
	}

	.admin-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	@media (max-width: 640px) {
		.nav-inner {
			height: auto;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
			padding: 12px 16px;
		}

		.nav-link.back {
			margin-left: 0;
		}

		.admin-main {
			padding: 20px 16px;
		}
	}
</style>
