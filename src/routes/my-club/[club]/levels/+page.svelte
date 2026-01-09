<script>
	import { marked } from 'marked';

	let { data } = $props();
	let club = $state(data.club);

	const levelDescriptions = {
		'level 1': `
## Level 1

This is the base level for clubs. At this level, your club receives:

- **Map Listing**: Your club is added to the official [Hack Club Map](https://hackclub.com/map)
- **Program Eligibility**: Participate in Hack Club programs and initiatives
- **Branding Rights**: Use Hack Club branding for your club
- **Team Support**: Receive support from the Hack Club team
- **Bi-Weekly Newsletter**: Get a bi-weekly emailed newsletter with updates and resources
`,
		'level 2': `
## Level 2

The second level for clubs. You receive all the perks from Level 1, plus:

- **Monthly Promotional Packages**: Receive posters and other materials to help promote your club
- **Free Stickers**: Get stickers to hand out at your club meetings. Order them [here](http://forms.hackclub.com/stickers)
- **Club Mail**: Get monthly physical packages to help your club.

**Requirement**: Ship 4 projects to reach this level.
`,
		'level 3': `
## Level 3

The third and final club level. You receive all perks from Level 1 and 2, plus:

- **Premium Perks**: Additional exclusive benefits (TBD)
- **Leadership Recognition**: Recognition as a thriving Hack Club

**Requirement**: Ship 8 projects to reach this level.
`
	};

	const levels = ['level 1', 'level 2', 'level 3'];
	let selectedLevel = $state(club.level || 'level 1');

	function getLevelIndex(level) {
		return levels.indexOf(level);
	}

	function getCurrentLevelIndex() {
		return getLevelIndex(club.level || 'level 1');
	}

	function isCurrentLevel(level) {
		return level === (club.level || 'level 1');
	}

	function isPastLevel(level) {
		return getLevelIndex(level) < getCurrentLevelIndex();
	}

	function isFutureLevel(level) {
		return getLevelIndex(level) > getCurrentLevelIndex();
	}

	function getShipsRequired(level) {
		if (level === 'level 2') return 4;
		if (level === 'level 3') return 8;
		return 0;
	}

	function getShipsRemaining(level) {
		const required = getShipsRequired(level);
		const current = club.ships?.length || 0;
		return Math.max(0, required - current);
	}

	function getProgressText(level) {
		if (isCurrentLevel(level) || isPastLevel(level)) {
			return 'You have reached this level!';
		}
		const remaining = getShipsRemaining(level);
		if (remaining === 0) {
			return 'You have reached this level!';
		}
		return `Ship ${remaining} more project${remaining === 1 ? '' : 's'} to reach this level.`;
	}

	function parseMarkdown(md) {
		return marked.parse(md);
	}
</script>

<svelte:head>
	<title>Club Levels - {club.name} - Clubs Event Portal</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{club.name}</h1>
			<p class="page-subtitle">Club Levels</p>
		</div>
	</header>

	<div class="current-status">
		<div class="status-label">Current Level</div>
		<div class="status-value">{(club.level || 'level 1').replace('level ', 'Level ')}</div>
		<div class="status-ships">{club.ships?.length || 0} ships completed</div>
	</div>

	<section class="levels-section">
		<div class="levels-grid">
			{#each levels as level, index}
				{@const levelNumber = index + 1}
				<button
					class="level-card"
					class:active={selectedLevel === level}
					class:current={isCurrentLevel(level)}
					class:past={isPastLevel(level)}
					class:future={isFutureLevel(level)}
					onclick={() => selectedLevel = level}
				>
					<div class="level-indicator">
						<div class="circle" class:filled={isCurrentLevel(level) || isPastLevel(level)}></div>
					</div>
					<div class="level-info">
						<span class="level-name">Level {levelNumber}</span>
						{#if isCurrentLevel(level)}
							<span class="level-badge current-badge">Current</span>
						{:else if isPastLevel(level)}
							<span class="level-badge past-badge">Completed</span>
						{:else}
							<span class="level-badge future-badge">{getShipsRequired(level)} ships needed</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>

		<div class="level-details">
			<div class="details-content">
				{@html parseMarkdown(levelDescriptions[selectedLevel])}
			</div>
			<div class="progress-status" class:achieved={isCurrentLevel(selectedLevel) || isPastLevel(selectedLevel)}>
				{getProgressText(selectedLevel)}
			</div>
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.back-link {
		font-size: 14px;
		color: #8492a6;
		text-decoration: none;
		margin-bottom: 8px;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 48px;
		font-weight: bold;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.page-subtitle {
		font-size: 18px;
		color: #8492a6;
		margin: 0;
	}

	.current-status {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 32px;
		text-align: center;
	}

	.status-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 8px;
	}

	.status-value {
		font-size: 36px;
		font-weight: bold;
		color: #ec3750;
		margin-bottom: 8px;
	}

	.status-ships {
		font-size: 16px;
		color: #1f2d3d;
	}

	.levels-section {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.levels-grid {
		display: flex;
		gap: 16px;
	}

	.level-card {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		text-align: left;
	}

	.level-card:hover {
		border-color: #ec3750;
	}

	.level-card.active {
		border-color: #ec3750;
		background: #fff5f7;
	}

	.level-card.current .level-indicator .circle {
		background: #33d6a6;
		border-color: #33d6a6;
	}

	.level-card.past .level-indicator .circle {
		background: #338eda;
		border-color: #338eda;
	}

	.level-indicator {
		flex-shrink: 0;
	}

	.circle {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 3px solid #e0e6ed;
		background: white;
		transition: all 0.2s;
	}

	.circle.filled {
		background: #33d6a6;
		border-color: #33d6a6;
	}

	.level-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.level-name {
		font-size: 18px;
		font-weight: 700;
		color: #1f2d3d;
	}

	.level-badge {
		font-size: 12px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 4px;
		display: inline-block;
		width: fit-content;
	}

	.current-badge {
		background: #dcfce7;
		color: #166534;
	}

	.past-badge {
		background: #dbeafe;
		color: #1e40af;
	}

	.future-badge {
		background: #f9fafc;
		color: #8492a6;
	}

	.level-details {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 32px;
	}

	.details-content {
		line-height: 1.7;
		color: #1f2d3d;
	}

	.details-content :global(h2) {
		font-size: 28px;
		font-weight: bold;
		color: #ec3750;
		margin: 0 0 16px 0;
	}

	.details-content :global(p) {
		margin: 0 0 16px 0;
	}

	.details-content :global(ul) {
		margin: 0 0 16px 0;
		padding-left: 24px;
	}

	.details-content :global(li) {
		margin-bottom: 8px;
	}

	.details-content :global(strong) {
		color: #1f2d3d;
	}

	.progress-status {
		margin-top: 24px;
		padding: 16px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		color: #8492a6;
		text-align: center;
	}

	.progress-status.achieved {
		background: #dcfce7;
		border-color: #33d6a6;
		color: #166534;
	}

	@media (max-width: 768px) {
		.levels-grid {
			flex-direction: column;
		}

		.page-title {
			font-size: 32px;
		}

		.status-value {
			font-size: 28px;
		}
	}
</style>
