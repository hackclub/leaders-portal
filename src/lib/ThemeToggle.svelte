<script>
	import { onMount } from 'svelte';

	let isDark = $state(false);

	onMount(() => {
		const explicit = document.documentElement.getAttribute('data-theme');
		isDark = explicit
			? explicit === 'dark'
			: window.matchMedia('(prefers-color-scheme: dark)').matches;
	});

	function toggleTheme() {
		isDark = !isDark;
		const value = isDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', value);
		try {
			localStorage.setItem('theme', value);
		} catch (e) {}
	}
</script>

<button
	class="theme-toggle"
	type="button"
	aria-label="Toggle dark mode"
	aria-pressed={isDark}
	title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	onclick={toggleTheme}
>
	{#if isDark}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
		</svg>
	{:else}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--color-muted);
		cursor: pointer;
		padding: 6px;
		border-radius: 8px;
	}

	.theme-toggle:hover {
		background: var(--bg-sunken);
		color: var(--color-text);
	}
</style>
