<script>
	import LevelCard from '$lib/LevelCard.svelte';
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	
	let { data } = $props();
	let clubs = $state(data.clubs);
	let helpModal = $state({ open: false, clubName: null, loading: false, ambassador: null, error: null });
	let mapOptOutState = $state({});
	let mapSettingsModal = $state({ open: false, clubName: null, latitude: '', longitude: '', fuzz: '0', optedOut: false, loading: false, error: null });

	$effect(() => {
		clubs.forEach(club => {
			if (club.role === 'leader' && !mapOptOutState[club.name]) {
				fetchMapOptOutStatus(club.name);
			}
		});
	});

	async function fetchMapOptOutStatus(clubName) {
		try {
			const response = await fetch(`/api/club/map-opt-out?clubName=${encodeURIComponent(clubName)}`);
			if (response.ok) {
				const data = await response.json();
				mapOptOutState[clubName] = { 
					optedOut: data.optedOut, 
					hasLocation: data.hasLocation,
					venueLat: data.venueLat,
					venueLng: data.venueLng,
					venueFuzz: data.venueFuzz
				};
			}
		} catch (err) {
			// Silently fail - button will show default state
		}
	}

	function handleRefresh(clubName, refreshedClub) {
		clubs = clubs.map(c => c.name === clubName ? mergeClubData(c, refreshedClub) : c);
	}

	async function openHelpModal(clubName) {
		helpModal = { open: true, clubName, loading: true, ambassador: null, error: null };
		try {
			const response = await fetch(`/api/club/ambassador?club_name=${encodeURIComponent(clubName)}`);
			if (!response.ok) {
				const data = await response.json();
				helpModal = { ...helpModal, loading: false, error: data.error || 'Failed to load ambassador' };
				return;
			}
			const ambassador = await response.json();
			helpModal = { ...helpModal, loading: false, ambassador };
		} catch (err) {
			helpModal = { ...helpModal, loading: false, error: 'Failed to load ambassador' };
		}
	}

	function closeHelpModal() {
		helpModal = { open: false, clubName: null, loading: false, ambassador: null, error: null };
	}

	function openMapSettings(clubName) {
		const state = mapOptOutState[clubName];
		mapSettingsModal = { 
			open: true, 
			clubName, 
			latitude: state?.venueLat || '', 
			longitude: state?.venueLng || '', 
			fuzz: state?.venueFuzz || '0',
			optedOut: state?.optedOut ?? false,
			loading: false, 
			error: null 
		};
	}

	function closeMapSettingsModal() {
		mapSettingsModal = { open: false, clubName: null, latitude: '', longitude: '', fuzz: '0', optedOut: false, loading: false, error: null };
	}

	async function submitMapSettings() {
		const lat = parseFloat(mapSettingsModal.latitude);
		const lng = parseFloat(mapSettingsModal.longitude);
		const fuzz = parseFloat(mapSettingsModal.fuzz);
		
		if (isNaN(lat) || isNaN(lng)) {
			mapSettingsModal = { ...mapSettingsModal, error: 'Please enter valid latitude and longitude values' };
			return;
		}
		
		if (lat < -90 || lat > 90) {
			mapSettingsModal = { ...mapSettingsModal, error: 'Latitude must be between -90 and 90' };
			return;
		}
		
		if (lng < -180 || lng > 180) {
			mapSettingsModal = { ...mapSettingsModal, error: 'Longitude must be between -180 and 180' };
			return;
		}

		if (isNaN(fuzz) || fuzz < -0.5 || fuzz > 0.5) {
			mapSettingsModal = { ...mapSettingsModal, error: 'Offset must be between -0.5 and 0.5' };
			return;
		}
		
		mapSettingsModal = { ...mapSettingsModal, loading: true, error: null };
		
		try {
			const response = await fetch('/api/club/map-opt-out', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					clubName: mapSettingsModal.clubName, 
					action: 'updateSettings', 
					latitude: lat, 
					longitude: lng,
					fuzz: fuzz,
					optedOut: mapSettingsModal.optedOut
				})
			});
			
			if (!response.ok) {
				const data = await response.json();
				mapSettingsModal = { ...mapSettingsModal, loading: false, error: data.error || 'Failed to save settings' };
				return;
			}
			
			const data = await response.json();
			mapOptOutState[mapSettingsModal.clubName] = { 
				optedOut: data.optedOut, 
				hasLocation: data.hasLocation,
				venueLat: data.venueLat,
				venueLng: data.venueLng,
				venueFuzz: data.venueFuzz
			};
			closeMapSettingsModal();
		} catch (err) {
			mapSettingsModal = { ...mapSettingsModal, loading: false, error: 'Failed to save settings' };
		}
	}
</script>

<svelte:head>
	<title>My Club - Clubs Event Portal</title>
</svelte:head>

<div class="container">
	<header>
		<h1 class="page-title">My Club</h1>
		<div class="header-buttons">
			<a href="/" class="nav-button">Home</a>
			<form method="POST" action="/logout" style="display: inline;">
				<button type="submit" class="nav-button">Logout</button>
			</form>
		</div>
	</header>

	<section class="clubs-info">
		{#if clubs.length > 0}
			<div class="clubs-grid">
				{#each clubs as club}
					<div class="club-card">
						<div class="club-header">
							<h3 class="club-name">{club.name}</h3>
							<div class="club-badges">
								<button class="contact-us-button" onclick={() => openHelpModal(club.name)} title="Contact your ambassador">
									<img 
										src="https://icons.hackclub.com/api/icons/black/message-simple-fill" 
										alt="Contact icon"
										width="24"
										height="24"
									/>
									<span>Contact Us</span>
								</button>
								<a href="/invite-coleader" class="contact-us-button coleader-btn" title="Add a co-leader">
									<span>+ Add Co-Leader</span>
								</a>
								<RefreshButton clubName={club.name} onRefresh={(refreshedClub) => handleRefresh(club.name, refreshedClub)} />
								{#if club.level}
									<span class="club-level">{club.level}</span>
								{/if}
								<span class="club-role {club.role}">{club.role}</span>
							</div>
						</div>

						<LevelCard currentLevel={club.level || 'Bronze'} clubShips={club.ships.length || 0} />

						<div class="stats-row">
							<a href="/my-club/{encodeURIComponent(club.name)}/members" class="stat-card">
								<span class="stat-number">{club.members?.length || 0}</span>
								<span class="stat-label">Members</span>
							</a>
							<a href="/my-club/{encodeURIComponent(club.name)}/ships" class="stat-card">
								<span class="stat-number">{club.ships?.length || 0}</span>
								<span class="stat-label">Ships</span>
							</a>
						</div>

						{#if club.joinCode}
							<div class="invite-section">
								<span class="invite-label">Invite link:</span>
								<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="invite-link">
									hack.club/join/{club.joinCode}
								</a>
							</div>
						{/if}

						{#if club.role === 'leader'}
							<div class="map-opt-out-section">
								{#if mapOptOutState[club.name]?.error}
									<span class="opt-out-error">{mapOptOutState[club.name].error}</span>
								{/if}
								<div class="map-buttons">
									{#if mapOptOutState[club.name]?.hasLocation && !mapOptOutState[club.name]?.optedOut}
										<a 
											href="https://hackclub.com/map#lat={mapOptOutState[club.name].venueLat}&lng={mapOptOutState[club.name].venueLng}&z=10"
											target="_blank"
											rel="noopener noreferrer"
											class="view-map-button"
										>
											View Club in Club Map
										</a>
									{/if}
									<button 
										class="map-settings-button" 
										onclick={() => openMapSettings(club.name)}
									>
										Map Settings
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>You are not a member of any clubs yet.</p>
			</div>
		{/if}
	</section>
</div>

<Modal open={helpModal.open} title="Contact Us" onClose={closeHelpModal}>
	{#if helpModal.loading}
		<p class="loading-text">Loading ambassador info...</p>
	{:else if helpModal.error}
		<p class="error-text">{helpModal.error}</p>
	{:else if helpModal.ambassador}
		<p class="help-intro">How would you like to contact your ambassador?</p>
		<div class="contact-options">
			{#if helpModal.ambassador.email}
				<a href="mailto:{helpModal.ambassador.email}" class="contact-button email-button">
					Email
				</a>
			{/if}
			{#if helpModal.ambassador.slackId}
				<a href="https://hackclub.enterprise.slack.com/team/{helpModal.ambassador.slackId}" target="_blank" rel="noopener noreferrer" class="contact-button slack-button">
					Slack
				</a>
			{/if}
		</div>
	{:else}
		<p class="error-text">No ambassador assigned to this club.</p>
	{/if}
</Modal>

<Modal open={mapSettingsModal.open} title="Map Settings" onClose={closeMapSettingsModal}>
	<p class="map-settings-intro">Configure your club's appearance on the <a href="https://hackclub.com/map" target="_blank" rel="noopener noreferrer">Hack Club Map</a>.</p>
	
	{#if mapSettingsModal.error}
		<p class="error-text">{mapSettingsModal.error}</p>
	{/if}
	
	<div class="opt-in-form">
		<div class="opt-out-toggle" class:opted-out={mapSettingsModal.optedOut}>
			<label class="toggle-label">
				<input 
					type="checkbox" 
					bind:checked={mapSettingsModal.optedOut}
					disabled={mapSettingsModal.loading}
				/>
				<span class="toggle-switch"></span>
				<span class="toggle-text">{mapSettingsModal.optedOut ? 'Hidden from map' : 'Visible on map'}</span>
			</label>
		</div>

		<div class="form-field">
			<label for="latitude">Latitude</label>
			<input 
				type="number" 
				id="latitude" 
				step="any"
				placeholder="e.g. 37.7749"
				bind:value={mapSettingsModal.latitude}
				disabled={mapSettingsModal.loading}
			/>
			<span class="field-hint">Click <a href="https://www.latlong.net/convert-address-to-lat-long.html" target="_blank" rel="noopener noreferrer">here</a> to convert an address to lat/long</span>
		</div>
		<div class="form-field">
			<label for="longitude">Longitude</label>
			<input 
				type="number" 
				id="longitude" 
				step="any"
				placeholder="e.g. -122.4194"
				bind:value={mapSettingsModal.longitude}
				disabled={mapSettingsModal.loading}
			/>
		</div>
		<div class="form-field">
			<label for="fuzz">Map Offset</label>
			<input 
				type="range" 
				id="fuzz" 
				min="-0.5"
				max="0.5"
				step="0.01"
				bind:value={mapSettingsModal.fuzz}
				disabled={mapSettingsModal.loading}
			/>
			<span class="field-hint">Offset: {parseFloat(mapSettingsModal.fuzz).toFixed(2)} (adjusts map pin position for privacy, set to zero for no offset.)</span>
		</div>
		<button 
			class="submit-opt-in" 
			onclick={submitMapSettings}
			disabled={mapSettingsModal.loading}
		>
			{#if mapSettingsModal.loading}
				Saving...
			{:else}
				Save Settings
			{/if}
		</button>
	</div>
</Modal>

<style>
	@font-face {
		font-family: 'Phantom Sans';
		src: url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff') format('woff'),
			url('https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2') format('woff2');
		font-weight: normal;
		font-style: normal;
		font-display: swap;
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.page-title {
		font-size: 48px;
		font-weight: bold;
		color: #ec3750;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.nav-button {
		padding: 10px 20px;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		font-size: 14px;
		border: 2px solid #ec3750;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
		background-color: #ec3750;
		color: white;
	}

	.nav-button:hover {
		background-color: #d62c47;
		border-color: #d62c47;
	}

	.clubs-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.club-card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 24px;
	}

	.club-card:hover {
		border-color: #ec3750;
	}

	.club-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 16px;
	}

	.club-name {
		font-size: 24px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
		flex: 1;
	}

	.club-badges {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.club-level {
		display: inline-flex;
		align-items: center;
		padding: 8px 14px;
		background-color: #dcfce7;
		border: 2px solid #dcfce7;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 700;
		color: #166534;
	}

	.club-role {
		display: inline-flex;
		align-items: center;
		padding: 8px 14px;
		border: 2px solid transparent;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 700;
	}

	.club-role.leader {
		background-color: #fef3c7;
		border-color: #fef3c7;
		color: #92400e;
	}

	.club-role.member {
		background-color: #dbeafe;
		border-color: #dbeafe;
		color: #1e40af;
	}

	.stats-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-top: 20px;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
	}

	.stat-card:hover {
		border-color: #ec3750;
		background: #fff5f7;
	}

	.stat-number {
		font-size: 36px;
		font-weight: bold;
		color: #ec3750;
	}

	.stat-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 4px;
	}

	.invite-section {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.invite-label {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
	}

	.invite-link {
		font-size: 14px;
		font-weight: 600;
		color: #338eda;
		text-decoration: none;
	}

	.invite-link:hover {
		text-decoration: underline;
	}

	.coleader-btn {
		border-color: #a633d6;
		color: #a633d6;
		text-decoration: none;
		min-height: 40px;
	}

	.coleader-btn:hover {
		border-color: #a633d6;
		color: #a633d6;
	}

	.empty-state {
		background: #f9fafc;
		padding: 48px;
		border-radius: 12px;
		border: 2px dashed #e0e6ed;
		text-align: center;
	}

	.empty-state p {
		color: #8492a6;
		font-size: 18px;
		margin: 0;
	}

	.contact-us-button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.contact-us-button:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.contact-us-button img {
		flex-shrink: 0;
	}

	.contact-us-button span {
		white-space: nowrap;
	}

	.loading-text {
		color: #8492a6;
		text-align: center;
		margin: 0;
	}

	.error-text {
		color: #ec3750;
		text-align: center;
		margin: 0;
	}

	.help-intro {
		color: #1f2d3d;
		text-align: center;
		margin: 0 0 20px 0;
	}

	.contact-options {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.contact-button {
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 14px;
		text-decoration: none;
		flex: 1;
		text-align: center;
	}

	.email-button {
		background-color: #ec3750;
		color: white;
	}

	.email-button:hover {
		background-color: #d62c47;
	}

	.slack-button {
		background-color: #33d6a6;
		color: white;
	}

	.slack-button:hover {
		background-color: #2bc095;
	}

	.map-opt-out-section {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
	}

	.map-buttons {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.view-map-button {
		padding: 10px 16px;
		background: #338eda;
		border: 2px solid #338eda;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		color: white;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
		text-decoration: none;
	}

	.view-map-button:hover {
		background: #2a7bc5;
		border-color: #2a7bc5;
	}

	.map-settings-button {
		padding: 10px 16px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
	}

	.map-settings-button:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.opt-out-error {
		font-size: 14px;
		font-weight: 500;
		color: #ec3750;
	}

	.opt-in-intro {
		color: #1f2d3d;
		margin: 0 0 16px 0;
		text-align: center;
	}

	.map-settings-intro {
		color: #8492a6;
		margin: 0 0 20px 0;
		text-align: center;
		font-size: 14px;
	}

	.map-settings-intro a {
		color: #338eda;
		text-decoration: none;
		font-weight: 500;
	}

	.map-settings-intro a:hover {
		text-decoration: underline;
	}

	.opt-in-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.opt-out-toggle {
		padding: 14px 16px;
		background: #e8f5e9;
		border: 2px solid #33d6a6;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.opt-out-toggle.opted-out {
		background: #fef3f4;
		border-color: #ec3750;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
	}

	.toggle-label input {
		display: none;
	}

	.toggle-switch {
		width: 44px;
		height: 24px;
		background: #33d6a6;
		border-radius: 12px;
		position: relative;
		transition: background 0.2s;
		flex-shrink: 0;
	}

	.toggle-switch::after {
		content: '';
		position: absolute;
		width: 18px;
		height: 18px;
		background: white;
		border-radius: 50%;
		top: 3px;
		left: 3px;
		transition: transform 0.2s;
	}

	.opted-out .toggle-switch {
		background: #ec3750;
	}

	.opted-out .toggle-switch::after {
		transform: translateX(20px);
	}

	.toggle-text {
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-field label {
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
	}

	.form-field input {
		padding: 10px 12px;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.form-field input:focus {
		outline: none;
		border-color: #338eda;
	}

	.form-field input:disabled {
		background-color: #f9fafc;
		color: #8492a6;
	}

	.form-field input[type="range"] {
		padding: 0;
		border: none;
		cursor: pointer;
	}

	.form-field input[type="range"]:focus {
		border: none;
	}

	.field-hint {
		font-size: 12px;
		color: #8492a6;
	}

	.field-hint a {
		color: #338eda;
	}

	.submit-opt-in {
		padding: 12px 20px;
		background-color: #33d6a6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		margin-top: 8px;
	}

	.submit-opt-in:hover:not(:disabled) {
		background-color: #2bc095;
	}

	.submit-opt-in:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
