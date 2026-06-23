<script>
	import SiteNav from '$lib/SiteNav.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Club Members</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<section class="hero">
		<div class="hero-text">
			<h1 class="title">Club Members</h1>
			<p class="subtitle">Join your Hack Club, connect with other members, and keep up with everything your club is building.</p>
		</div>
		<iframe
			src="https://hackclub.github.io/map?banner=small&mode=signin"
			class="hero-map"
			title="Hack Club Map"
			loading="lazy"
		></iframe>
	</section>

	<main>
		<section class="actions">
			<div class="action-card">
				<h2 class="card-title">Join a club</h2>
				<p class="card-text">Got an invite code from your club leader? Join your club to see events, ships, and announcements.</p>
				<a href="/join" class="cta">Join a club</a>
			</div>

			<div class="action-card">
 				<h2 class="card-title">Log in as a member</h2>
				<p class="card-text">Already part of a club? Log in to view your club's progress and stay in the loop.</p>
				<a href="/members/login" class="cta secondary">Log in</a>
			</div>
		</section>
	</main>

	<footer>
		<a href="https://apply.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Start a club</a>
		<a href="https://ysws.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">All YSWS Programs</a>
		<a href="https://guide.leaders.hackclub.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Club Leaders Guide</a>
		<a href="https://hackclub.github.io/map" target="_blank" rel="noopener noreferrer" class="footer-link">Club Map</a>
		<a href="/posters" class="footer-link">Club Posters</a>
	</footer>
</div>

<style>
	:global(body) {
		background-color: var(--bg-page);
		color: var(--color-text);
		margin: 0;
		padding: 0;
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 24px 16px 48px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		align-items: center;
		margin-bottom: 28px;
	}

	.hero-text {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.title {
		font-size: 36px;
		font-weight: 700;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.subtitle {
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
		max-width: 42ch;
	}

	.hero-map {
		width: 100%;
		height: 240px;
		border: 1px solid var(--color-border);
		border-radius: 12px;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 24px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 12px;
	}

	.accent {
		display: inline-block;
		width: 4px;
		height: 22px;
		border-radius: 2px;
		background: var(--accent, #ec3750);
	}

	.card-title {
		color: var(--color-text);
		font-weight: 700;
		font-size: 22px;
		margin: 0;
	}

	.card-text {
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
		flex: 1;
	}

	.cta {
		align-self: flex-start;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		font-family: inherit;
		text-decoration: none;
		border: 1px solid #ec3750;
		background: #ec3750;
		color: #ffffff;
		cursor: pointer;
	}

	.cta:hover {
		background: #d63349;
		border-color: #d63349;
	}

	.cta.secondary {
		border-color: #338eda;
		background: #338eda;
	}

	.cta.secondary:hover {
		background: #2b78ba;
		border-color: #2b78ba;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px 24px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--color-border);
	}

	.footer-link {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-muted);
		text-decoration: none;
	}

	.footer-link:hover {
		color: #ec3750;
	}

	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.hero-map {
			height: 200px;
			order: -1;
		}

		.title {
			font-size: 28px;
		}

		.actions {
			grid-template-columns: 1fr;
		}

		.card-title {
			font-size: 19px;
		}
	}
</style>
