<script>
	let { clubName, section, children } = $props();
</script>

<header class="club-header">
	<div class="header-left">
		<a href="/my-club" class="back-link">← My Club</a>
		<h1 class="page-title">{clubName}</h1>
		<p class="page-subtitle">{section}</p>
	</div>
	{#if children}
		<div class="header-buttons">{@render children()}</div>
	{/if}
</header>

<style>
	.club-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 28px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.back-link {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		text-decoration: none;
		margin-bottom: 4px;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 30px;
		font-weight: 700;
		color: #1f2d3d;
		letter-spacing: -0.02em;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.page-subtitle {
		font-size: 16px;
		font-weight: 600;
		color: #ec3750;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
	}

	@media (max-width: 600px) {
		.page-title {
			font-size: 26px;
		}
	}
</style>
