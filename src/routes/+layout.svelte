<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/Sidebar.svelte';
	import ToastContainer from '$lib/ToastContainer.svelte';
	import DarkModeFab from '$lib/DarkModeFab.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let { data, children } = $props();
	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch((err) => {
				console.log('SW registration failed:', err);
			});
		}
	});

	const noSidebarPaths = ['/auth', '/email-login', '/logout', '/join'];
	
	let showSidebar = $derived.by(() => {
		const path = $page.url.pathname;
		if (!data.user) return false;
		if (noSidebarPaths.some(p => path === p || path.startsWith(p + '/'))) return false;
		return true;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Global Toast Notifications -->
<ToastContainer />

{#if showSidebar}
	<div class="app-layout">
		<Sidebar user={data.user} clubs={data.clubs || []} memberClubs={data.memberClubs || []} currentPath={$page.url.pathname} bind:sidebarOpen />
		
		<div class="app-main">
			<!-- Mobile header -->
			<header class="mobile-header">
				<button class="menu-btn" onclick={toggleSidebar} aria-label="Toggle navigation menu">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="3" y1="12" x2="21" y2="12"/>
						<line x1="3" y1="6" x2="21" y2="6"/>
						<line x1="3" y1="18" x2="21" y2="18"/>
					</svg>
				</button>
				<a href="/" class="mobile-logo">
					<img src="https://assets.hackclub.com/icon-rounded.svg" alt="" />
					<span>Club Portal</span>
				</a>
				<div class="mobile-spacer"></div>
			</header>

			{@render children?.()}
		</div>
	</div>
{:else}
	{@render children?.()}
	<!-- Show floating dark mode button on pages without sidebar -->
	<DarkModeFab />
{/if}

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
	}

	.app-main {
		flex: 1;
		margin-left: 280px;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.mobile-header {
		display: none;
		position: sticky;
		top: 0;
		z-index: 100;
		background: white;
		border-bottom: 1px solid #e0e6ed;
		padding: 12px 16px;
		align-items: center;
		gap: 12px;
	}

	.menu-btn {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 10px;
		color: #3c4858;
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-btn:hover {
		background: #ec3750;
		border-color: #ec3750;
		color: white;
	}

	.mobile-logo {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}

	.mobile-logo img {
		height: 32px;
	}

	.mobile-logo span {
		font-weight: 700;
		font-size: 1rem;
		color: #1f2d3d;
	}

	.mobile-spacer {
		width: 44px;
	}

	@media (max-width: 1024px) {
		.app-main {
			margin-left: 0;
		}

		.mobile-header {
			display: flex;
		}
	}

	@media (max-width: 480px) {
		.mobile-header {
			padding: 10px 12px;
		}
		
		.menu-btn {
			width: 40px;
			height: 40px;
		}
		
		.mobile-logo img {
			height: 28px;
		}
		
		.mobile-logo span {
			font-size: 0.9rem;
		}
		
		.mobile-spacer {
			width: 40px;
		}
	}

	/* Safe area support for PWA */
	@supports (padding: max(0px)) {
		.mobile-header {
			padding-top: max(12px, env(safe-area-inset-top));
			padding-left: max(16px, env(safe-area-inset-left));
			padding-right: max(16px, env(safe-area-inset-right));
		}
	}
</style>
