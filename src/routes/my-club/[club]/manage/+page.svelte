<script>
	import { page } from '$app/stores';
	
	let { data, form } = $props();
	let club = $state(data.club);
	let settings = $state(data.settings);
	
	let isSaving = $state(false);
	let isMapSaving = $state(false);
	let showDormantWarning = $state(false);
	
	let clubName = $state(settings?.clubName || '');
	let clubStatus = $state(settings?.clubStatus || '');
	let venueType = $state(settings?.venueType || '');
	let venueName = $state(settings?.venueName || '');
	let venueAddressLine1 = $state(settings?.venueAddressLine1 || '');
	let venueAddressCity = $state(settings?.venueAddressCity || '');
	let venueAddressState = $state(settings?.venueAddressState || '');
	let venueAddressCountry = $state(settings?.venueAddressCountry || '');
	let venueAddressZip = $state(settings?.venueAddressZip || '');
	let estAttendees = $state(settings?.estAttendees || '');
	let callMeetingDays = $state(settings?.callMeetingDays || []);
	let callMeetingLength = $state(settings?.callMeetingLength || '');
	let callClubIntrest = $state(settings?.callClubIntrest || []);
	
	let latitude = $state(settings?.venueLat || '');
	let longitude = $state(settings?.venueLng || '');
	let fuzz = $state(settings?.venueFuzz || 0);
	let optedOut = $state(settings?.mapOptOut || false);

	const venueTypeOptions = ['School/College', 'Makerspace', 'Online', 'Other'];
	const meetingDayOptions = ['Undecided', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const meetingLengthOptions = ['Undecided', '30min', '45min', '60min', '90min', '120+min'];
	const clubInterestOptions = ['Web Dev', 'Game Dev', 'CAD', 'Hardware', 'Hackathons', 'Other', 'Mobile App Dev, and Arduino'];
	const isActive = settings?.clubStatus === 'Active';
	
	function toggleMeetingDay(day) {
		if (callMeetingDays.includes(day)) {
			callMeetingDays = callMeetingDays.filter(d => d !== day);
		} else {
			callMeetingDays = [...callMeetingDays, day];
		}
	}

	function toggleInterest(interest) {
		if (callClubIntrest.includes(interest)) {
			callClubIntrest = callClubIntrest.filter(i => i !== interest);
		} else {
			callClubIntrest = [...callClubIntrest, interest];
		}
	}
	
	function handleStatusChange(e) {
		const newStatus = e.target.value;
		if (newStatus === 'Dormant' && clubStatus !== 'Dormant') {
			showDormantWarning = true;
		}
		clubStatus = newStatus;
	}
	
	function cancelDormant() {
		clubStatus = settings?.clubStatus || '';
		showDormantWarning = false;
	}
	
	function confirmDormant() {
		showDormantWarning = false;
	}

	const successFromUrl = $page.url.searchParams.get('success') === '1';
</script>

<svelte:head>
	<title>Manage Club - {club.name} - Club Leaders Portal</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{club.name}</h1>
			<p class="page-subtitle">Manage Club</p>
		</div>
	</header>

	{#if successFromUrl || form?.success}
		<div class="success-banner">{form?.message || 'Settings updated successfully!'}</div>
	{/if}

	{#if form?.error}
		<div class="error-banner">{form.error}</div>
	{/if}

	<div class="sections-grid">
		<section class="settings-section">
			<h2>Club Settings</h2>
			<form method="POST" action="?/updateSettings" onsubmit={() => isSaving = true}>
				<div class="form-group">
					<label for="club_name">Club Name</label>
					<input 
						type="text" 
						id="club_name" 
						name="club_name" 
						bind:value={clubName}
						required
					/>
				</div>

				<div class="form-group">
					<label for="club_status">Club Status</label>
					{#if isActive}
						<select 
							id="club_status" 
							name="club_status" 
							value={clubStatus}
							onchange={handleStatusChange}
						>
							<option value="Active">Active</option>
							<option value="Dormant">Dormant</option>
						</select>
						<p class="field-hint">Warning: Setting to Dormant will close your club permanently.</p>
					{:else}
						<input 
							type="text" 
							value={clubStatus} 
							disabled 
							class="disabled-input"
						/>
						<input type="hidden" name="club_status" value={clubStatus} />
						<p class="field-hint">Club status cannot be changed once dormant.</p>
					{/if}
				</div>

				<div class="form-group">
					<label for="est_attendees">Estimated # of Attendees</label>
					<input 
						type="text" 
						id="est_attendees" 
						name="est_attendees" 
						bind:value={estAttendees}
						placeholder="e.g., 15-20"
					/>
				</div>

				<h3>Meeting Preferences</h3>

				<div class="form-group">
					<label>Meeting Days</label>
					<p class="field-hint">Select all that apply</p>
					<div class="checkbox-group">
						{#each meetingDayOptions as day}
							<label class="checkbox-label">
								<input 
									type="checkbox" 
									name="call_meeting_days"
									value={day}
									checked={callMeetingDays.includes(day)}
									onchange={() => toggleMeetingDay(day)}
								/>
								<span class="checkbox-text">{day}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="form-group">
					<label for="call_meeting_length">Meeting Length</label>
					<select 
						id="call_meeting_length" 
						name="call_meeting_length" 
						bind:value={callMeetingLength}
					>
						<option value="">Select meeting length...</option>
						{#each meetingLengthOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label>Club Interests</label>
					<p class="field-hint">Select all that apply</p>
					<div class="checkbox-group">
						{#each clubInterestOptions as interest}
							<label class="checkbox-label">
								<input 
									type="checkbox" 
									name="call_club_intrest"
									value={interest}
									checked={callClubIntrest.includes(interest)}
									onchange={() => toggleInterest(interest)}
								/>
								<span class="checkbox-text">{interest}</span>
							</label>
						{/each}
					</div>
				</div>

				<h3>Venue Information</h3>

				<div class="form-group">
					<label for="venue_type">Venue Type</label>
					<select 
						id="venue_type" 
						name="venue_type" 
						bind:value={venueType}
					>
						<option value="">Select venue type...</option>
						{#each venueTypeOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="venue_name">Venue Name</label>
					<input 
						type="text" 
						id="venue_name" 
						name="venue_name" 
						bind:value={venueName}
						placeholder="e.g., Lincoln High School"
					/>
				</div>

				<div class="form-group">
					<label for="venue_address_line_1">Address Line 1</label>
					<input 
						type="text" 
						id="venue_address_line_1" 
						name="venue_address_line_1" 
						bind:value={venueAddressLine1}
						placeholder="Street address"
					/>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="venue_address_city">City</label>
						<input 
							type="text" 
							id="venue_address_city" 
							name="venue_address_city" 
							bind:value={venueAddressCity}
						/>
					</div>
					<div class="form-group">
						<label for="venue_address_state">State/Province</label>
						<input 
							type="text" 
							id="venue_address_state" 
							name="venue_address_state" 
							bind:value={venueAddressState}
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="venue_address_country">Country</label>
						<input 
							type="text" 
							id="venue_address_country" 
							name="venue_address_country" 
							bind:value={venueAddressCountry}
						/>
					</div>
					<div class="form-group">
						<label for="venue_address_zip">ZIP/Postal Code</label>
						<input 
							type="text" 
							id="venue_address_zip" 
							name="venue_address_zip" 
							bind:value={venueAddressZip}
						/>
					</div>
				</div>

				<button type="submit" class="save-btn" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Settings'}
				</button>
			</form>
		</section>

		<section class="settings-section">
			<h2>Map Settings</h2>
			<p class="section-intro">
				Control how your club appears on the <a href="https://hackclub.com/map" target="_blank" rel="noopener noreferrer">Hack Club Map</a>.
			</p>

			{#if form?.mapSuccess}
				<div class="success-message">{form.message || 'Map settings updated!'}</div>
			{/if}

			{#if form?.mapError}
				<div class="error-message">{form.mapError}</div>
			{/if}

			<form method="POST" action="?/updateMapSettings" onsubmit={() => isMapSaving = true}>
				<div class="opt-out-toggle" class:opted-out={optedOut}>
					<label class="toggle-label">
						<input 
							type="checkbox" 
							bind:checked={optedOut}
						/>
						<input type="hidden" name="opted_out" value={optedOut ? 'true' : 'false'} />
						<span class="toggle-switch"></span>
						<span class="toggle-text">
							{optedOut ? 'Hidden from map' : 'Visible on map'}
						</span>
					</label>
				</div>

				<div class="form-group">
					<label for="latitude">Latitude</label>
					<input 
						type="number" 
						id="latitude" 
						name="latitude" 
						bind:value={latitude}
						step="any"
						min="-90"
						max="90"
						placeholder="e.g., 37.7749"
						disabled={optedOut}
					/>
					<p class="field-hint">
						Find your coordinates on <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer">latlong.net</a>
					</p>
				</div>

				<div class="form-group">
					<label for="longitude">Longitude</label>
					<input 
						type="number" 
						id="longitude" 
						name="longitude" 
						bind:value={longitude}
						step="any"
						min="-180"
						max="180"
						placeholder="e.g., -122.4194"
						disabled={optedOut}
					/>
				</div>

				<div class="form-group">
					<label for="fuzz">Location Offset: {fuzz}</label>
					<input 
						type="range" 
						id="fuzz" 
						name="fuzz" 
						bind:value={fuzz}
						min="-0.5"
						max="0.5"
						step="0.01"
						disabled={optedOut}
					/>
					<p class="field-hint">Add a small offset to your exact location for privacy.</p>
				</div>

				{#if latitude && longitude && !optedOut}
					<a 
						href="https://hackclub.com/map#lat={latitude}&lng={longitude}&z=10"
						target="_blank"
						rel="noopener noreferrer"
						class="view-map-link"
					>
						View Club on Map 
					</a>
				{/if}

				<button type="submit" class="save-btn map-save-btn" disabled={isMapSaving}>
					{isMapSaving ? 'Saving...' : 'Save Map Settings'}
				</button>
			</form>
		</section>

		<section class="settings-section">
			<h2>Co-Leaders</h2>
			<p class="section-intro">
				Invite another leader to help manage your club.
			</p>
			<a href="/invite-coleader" class="action-btn">
				+ Add Co-Leader
			</a>
		</section>
	</div>
</div>

{#if showDormantWarning}
	<div class="modal-overlay" role="dialog" aria-modal="true">
		<div class="modal">
			<div class="modal-header">
				<h3>⚠️ Warning: Make Club Dormant?</h3>
			</div>
			<div class="modal-body">
				<p>Are you sure you want to set your club to <strong>Dormant</strong>?</p>
				<p class="warning-text">This action will close your club and <strong>cannot be undone</strong>. You will not be able to reactivate the club.</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="cancel-btn" onclick={cancelDormant}>Cancel</button>
				<button type="button" class="danger-btn" onclick={confirmDormant}>Yes, Make Dormant</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	header {
		margin-bottom: 32px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.back-link {
		color: #338eda;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.page-title {
		font-size: 32px;
		font-weight: 700;
		color: #1f2d3d;
		margin: 8px 0 0 0;
	}

	.page-subtitle {
		font-size: 18px;
		color: #8492a6;
		margin: 4px 0 0 0;
	}

	.success-banner {
		background: #e6fff2;
		color: #33d6a6;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-weight: 600;
		border: 2px solid #33d6a6;
	}

	.error-banner {
		background: #fff5f7;
		color: #ec3750;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-weight: 600;
		border: 2px solid #ec3750;
	}

	.sections-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.settings-section {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 24px;
	}

	.settings-section h2 {
		font-size: 20px;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.settings-section h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 24px 0 16px 0;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
	}

	.section-intro {
		color: #8492a6;
		font-size: 14px;
		margin: 0 0 20px 0;
	}

	.section-intro a {
		color: #338eda;
		text-decoration: none;
		font-weight: 500;
	}

	.section-intro a:hover {
		text-decoration: underline;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 6px;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #338eda;
	}

	.form-group input:disabled,
	.form-group select:disabled {
		background-color: #f9fafc;
		color: #8492a6;
		cursor: not-allowed;
	}

	.form-group input[type="range"] {
		padding: 0;
		border: none;
		cursor: pointer;
	}

	.form-group input[type="range"]:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.disabled-input {
		background-color: #f9fafc;
		color: #8492a6;
	}

	.field-hint {
		font-size: 12px;
		color: #8492a6;
		margin: 6px 0 0 0;
	}

	.field-hint a {
		color: #338eda;
	}

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.checkbox-label:hover {
		border-color: #338eda;
	}

	.checkbox-label:has(input:checked) {
		background: #e6f4ff;
		border-color: #338eda;
	}

	.checkbox-label input[type="checkbox"] {
		accent-color: #338eda;
		width: 16px;
		height: 16px;
	}

	.checkbox-text {
		font-size: 14px;
		color: #1f2d3d;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	.save-btn {
		padding: 12px 24px;
		background: #33d6a6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		margin-top: 8px;
	}

	.save-btn:hover:not(:disabled) {
		background: #2bc095;
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.map-save-btn {
		margin-top: 16px;
	}

	.action-btn {
		display: inline-block;
		padding: 12px 24px;
		background: #338eda;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.action-btn:hover {
		background: #2a7bc5;
	}

	.view-map-link {
		display: inline-block;
		color: #338eda;
		font-weight: 600;
		text-decoration: none;
		margin-top: 8px;
		margin-right: 8px;
	}

	.view-map-link:hover {
		text-decoration: underline;
	}

	.opt-out-toggle {
		padding: 14px 16px;
		background: #e8f5e9;
		border: 2px solid #33d6a6;
		border-radius: 8px;
		transition: all 0.2s;
		margin-bottom: 20px;
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

	.toggle-label input[type="checkbox"] {
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

	.success-message {
		background: #e6fff2;
		color: #33d6a6;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #33d6a6;
	}

	.error-message {
		background: #fff5f7;
		color: #ec3750;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #ec3750;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 12px;
		width: 90%;
		max-width: 450px;
		border: 2px solid #e0e6ed;
	}

	.modal-header {
		padding: 20px 24px;
		border-bottom: 1px solid #e0e6ed;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		color: #1f2d3d;
		border: none;
		padding: 0;
	}

	.modal-body {
		padding: 24px;
	}

	.modal-body p {
		margin: 0 0 12px 0;
		color: #1f2d3d;
	}

	.warning-text {
		color: #ec3750;
		font-weight: 500;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid #e0e6ed;
	}

	.cancel-btn {
		padding: 10px 20px;
		background: #f9fafc;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.cancel-btn:hover {
		background: #e0e6ed;
	}

	.danger-btn {
		padding: 10px 20px;
		background: #ec3750;
		color: white;
		border: 2px solid #ec3750;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.danger-btn:hover {
		background: #d62c47;
		border-color: #d62c47;
	}
</style>
