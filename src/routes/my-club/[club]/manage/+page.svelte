<script>
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast.js';
	import InviteCoLeaderModal from '$lib/InviteCoLeaderModal.svelte';
	
	let { data, form } = $props();
	let club = $state(data.club);
	let settings = $state(data.settings);
	
	let isSaving = $state(false);
	let isMapSaving = $state(false);
	let showDormantWarning = $state(false);
	let showInviteModal = $state(false);
	let activeTab = $state('general');
	
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
	let clubWebsite = $state(settings?.clubWebsite || '');
	
	let latitude = $state(settings?.venueLat || '');
	let longitude = $state(settings?.venueLng || '');
	let fuzz = $state(settings?.venueFuzz || 0);
	let optedOut = $state(settings?.mapOptOut || false);
	
	function getClubSlug(name) {
		return name.toLowerCase().replace(/\s+/g, '-');
	}

	const venueTypeOptions = ['School/College', 'Makerspace', 'Online', 'Other'];
	const meetingDayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const meetingLengthOptions = ['30min', '45min', '60min', '90min', '120+min'];
	const clubInterestOptions = ['Web Dev', 'Game Dev', 'CAD', 'Hardware', 'Hackathons', 'Mobile App Dev', 'Arduino', 'Other'];
	const isActive = settings?.clubStatus === 'Active';
	
	const tabs = [
		{ id: 'general', label: 'General', icon: 'settings' },
		{ id: 'meetings', label: 'Meetings', icon: 'calendar' },
		{ id: 'venue', label: 'Venue', icon: 'map-pin' },
		{ id: 'map', label: 'Map', icon: 'globe' },
		{ id: 'team', label: 'Team', icon: 'users' }
	];
	
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

	$effect(() => {
		if (form?.success) {
			toasts.success(form?.message || 'Settings saved successfully!');
		}
		if (form?.error) {
			toasts.error(form.error);
		}
		if (form?.mapSuccess) {
			toasts.success(form?.message || 'Map settings updated!');
		}
		if (form?.mapError) {
			toasts.error(form.mapError);
		}
	});
	
	const successFromUrl = $page.url.searchParams.get('success') === '1';
	$effect(() => {
		if (successFromUrl) {
			toasts.success('Settings updated successfully!');
		}
	});
</script>

<svelte:head>
	<title>Manage Club - {club.name} - Hack Club</title>
</svelte:head>

<div class="manage-page">
	<!-- Header -->
	<header class="page-header">
		<div class="header-top">
			<a href="/my-club" class="back-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to My Club
			</a>
		</div>
		<div class="header-content">
			<div class="header-icon">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
				</svg>
			</div>
			<div>
				<h1>{club.name}</h1>
				<p class="subtitle">Manage your club settings and team</p>
			</div>
		</div>
	</header>

	<!-- Tab Navigation -->
	<nav class="tab-nav">
		{#each tabs as tab}
			<button 
				class="tab-btn" 
				class:active={activeTab === tab.id}
				onclick={() => activeTab = tab.id}
			>
				{#if tab.icon === 'settings'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3"/>
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
					</svg>
				{:else if tab.icon === 'calendar'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
				{:else if tab.icon === 'map-pin'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
				{:else if tab.icon === 'globe'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<line x1="2" y1="12" x2="22" y2="12"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
					</svg>
				{:else if tab.icon === 'users'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
				{/if}
				<span>{tab.label}</span>
			</button>
		{/each}
	</nav>

	<!-- Tab Content -->
	<div class="tab-content">
		<!-- General Settings -->
		{#if activeTab === 'general'}
			<section class="settings-card animate-fadeInUp">
				<div class="card-header">
					<h2>General Settings</h2>
					<p>Basic information about your club</p>
				</div>
				<form method="POST" action="?/updateSettings" onsubmit={() => isSaving = true}>
					<div class="form-grid">
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
									<option value="Active">✓ Active</option>
									<option value="Dormant">⏸ Dormant</option>
								</select>
								<p class="field-hint">⚠️ Setting to Dormant will close your club permanently.</p>
							{:else}
								<div class="status-badge dormant">
									<span class="status-dot"></span>
									{clubStatus}
								</div>
								<input type="hidden" name="club_status" value={clubStatus} />
								<p class="field-hint">Club status cannot be changed once dormant.</p>
							{/if}
						</div>

						<div class="form-group full-width">
							<label for="club_website">Club Website</label>
							<input 
								type="url" 
								id="club_website" 
								name="club_website" 
								bind:value={clubWebsite}
								placeholder="https://yourclub.com"
							/>
							{#if clubWebsite}
								<div class="link-preview">
									<span class="link-label">Your club redirect:</span>
									<a href="https://hack.club/club/{getClubSlug(club.name)}" target="_blank" rel="noopener noreferrer">
										hack.club/club/{getClubSlug(club.name)}
									</a>
								</div>
							{/if}
						</div>

						<div class="form-group">
							<label for="est_attendees">Estimated Attendees</label>
							<input 
								type="text" 
								id="est_attendees" 
								name="est_attendees" 
								bind:value={estAttendees}
								placeholder="e.g., 15-20"
							/>
						</div>
					</div>
					
					<!-- Hidden fields for other settings -->
					<input type="hidden" name="venue_type" value={venueType} />
					<input type="hidden" name="venue_name" value={venueName} />
					<input type="hidden" name="venue_address_line_1" value={venueAddressLine1} />
					<input type="hidden" name="venue_address_city" value={venueAddressCity} />
					<input type="hidden" name="venue_address_state" value={venueAddressState} />
					<input type="hidden" name="venue_address_country" value={venueAddressCountry} />
					<input type="hidden" name="venue_address_zip" value={venueAddressZip} />
					{#each callMeetingDays as day}
						<input type="hidden" name="call_meeting_days" value={day} />
					{/each}
					<input type="hidden" name="call_meeting_length" value={callMeetingLength} />
					{#each callClubIntrest as interest}
						<input type="hidden" name="call_club_intrest" value={interest} />
					{/each}

					<div class="form-actions">
						<button type="submit" class="btn-save" disabled={isSaving}>
							{#if isSaving}
								<span class="spinner"></span>
								Saving...
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
									<polyline points="17 21 17 13 7 13 7 21"/>
									<polyline points="7 3 7 8 15 8"/>
								</svg>
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</section>
		{/if}

		<!-- Meeting Preferences -->
		{#if activeTab === 'meetings'}
			<section class="settings-card animate-fadeInUp">
				<div class="card-header">
					<h2>Meeting Preferences</h2>
					<p>When and how long do you meet?</p>
				</div>
				<form method="POST" action="?/updateSettings" onsubmit={() => isSaving = true}>
					<div class="form-group">
						<label id="meeting-days-label">Meeting Days</label>
						<p class="field-hint">Select all days your club meets</p>
						<div class="chip-group" role="group" aria-labelledby="meeting-days-label">
							{#each meetingDayOptions as day}
								<button 
									type="button"
									class="chip" 
									class:selected={callMeetingDays.includes(day)}
									onclick={() => toggleMeetingDay(day)}
								>
									{day}
								</button>
							{/each}
						</div>
						{#each callMeetingDays as day}
							<input type="hidden" name="call_meeting_days" value={day} />
						{/each}
					</div>

					<div class="form-group">
						<label id="meeting-length-label">Meeting Duration</label>
						<div class="radio-cards" role="group" aria-labelledby="meeting-length-label">
							{#each meetingLengthOptions as option}
								<label class="radio-card" class:selected={callMeetingLength === option}>
									<input 
										type="radio" 
										name="call_meeting_length"
										value={option}
										bind:group={callMeetingLength}
									/>
									<span class="radio-label">{option}</span>
								</label>
							{/each}
						</div>
					</div>

					<div class="form-group">
						<label id="club-interests-label">Club Interests</label>
						<p class="field-hint">What does your club focus on?</p>
						<div class="chip-group" role="group" aria-labelledby="club-interests-label">
							{#each clubInterestOptions as interest}
								<button 
									type="button"
									class="chip" 
									class:selected={callClubIntrest.includes(interest)}
									onclick={() => toggleInterest(interest)}
								>
									{interest}
								</button>
							{/each}
						</div>
						{#each callClubIntrest as interest}
							<input type="hidden" name="call_club_intrest" value={interest} />
						{/each}
					</div>
					
					<!-- Hidden fields -->
					<input type="hidden" name="club_name" value={clubName} />
					<input type="hidden" name="club_status" value={clubStatus} />
					<input type="hidden" name="club_website" value={clubWebsite} />
					<input type="hidden" name="est_attendees" value={estAttendees} />
					<input type="hidden" name="venue_type" value={venueType} />
					<input type="hidden" name="venue_name" value={venueName} />
					<input type="hidden" name="venue_address_line_1" value={venueAddressLine1} />
					<input type="hidden" name="venue_address_city" value={venueAddressCity} />
					<input type="hidden" name="venue_address_state" value={venueAddressState} />
					<input type="hidden" name="venue_address_country" value={venueAddressCountry} />
					<input type="hidden" name="venue_address_zip" value={venueAddressZip} />

					<div class="form-actions">
						<button type="submit" class="btn-save" disabled={isSaving}>
							{#if isSaving}
								<span class="spinner"></span>
								Saving...
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
									<polyline points="17 21 17 13 7 13 7 21"/>
									<polyline points="7 3 7 8 15 8"/>
								</svg>
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</section>
		{/if}

		<!-- Venue Information -->
		{#if activeTab === 'venue'}
			<section class="settings-card animate-fadeInUp">
				<div class="card-header">
					<h2>Venue Information</h2>
					<p>Where does your club meet?</p>
				</div>
				<form method="POST" action="?/updateSettings" onsubmit={() => isSaving = true}>
					<div class="form-grid">
						<div class="form-group">
							<label for="venue_type">Venue Type</label>
							<select id="venue_type" name="venue_type" bind:value={venueType}>
								<option value="">Select type...</option>
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

						<div class="form-group full-width">
							<label for="venue_address_line_1">Street Address</label>
							<input 
								type="text" 
								id="venue_address_line_1" 
								name="venue_address_line_1" 
								bind:value={venueAddressLine1}
								placeholder="123 Main Street"
							/>
						</div>

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
					
					<!-- Hidden fields -->
					<input type="hidden" name="club_name" value={clubName} />
					<input type="hidden" name="club_status" value={clubStatus} />
					<input type="hidden" name="club_website" value={clubWebsite} />
					<input type="hidden" name="est_attendees" value={estAttendees} />
					{#each callMeetingDays as day}
						<input type="hidden" name="call_meeting_days" value={day} />
					{/each}
					<input type="hidden" name="call_meeting_length" value={callMeetingLength} />
					{#each callClubIntrest as interest}
						<input type="hidden" name="call_club_intrest" value={interest} />
					{/each}

					<div class="form-actions">
						<button type="submit" class="btn-save" disabled={isSaving}>
							{#if isSaving}
								<span class="spinner"></span>
								Saving...
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
									<polyline points="17 21 17 13 7 13 7 21"/>
									<polyline points="7 3 7 8 15 8"/>
								</svg>
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</section>
		{/if}

		<!-- Map Settings -->
		{#if activeTab === 'map'}
			<section class="settings-card animate-fadeInUp">
				<div class="card-header">
					<h2>Map Settings</h2>
					<p>Control how your club appears on the <a href="https://hackclub.com/map" target="_blank" rel="noopener noreferrer">Hack Club Map</a></p>
				</div>
				<form method="POST" action="?/updateMapSettings" onsubmit={() => isMapSaving = true}>
					<div class="visibility-toggle" class:hidden={optedOut}>
						<div class="toggle-info">
							<span class="toggle-icon">
								{#if optedOut}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
										<line x1="1" y1="1" x2="23" y2="23"/>
									</svg>
								{:else}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
								{/if}
							</span>
							<div>
								<span class="toggle-title">{optedOut ? 'Hidden from map' : 'Visible on map'}</span>
								<span class="toggle-desc">{optedOut ? 'Your club won\'t appear on the public map' : 'Your club is discoverable by other hackers'}</span>
							</div>
						</div>
						<label class="switch">
							<input type="checkbox" bind:checked={optedOut} />
							<span class="slider"></span>
						</label>
						<input type="hidden" name="opted_out" value={optedOut ? 'true' : 'false'} />
					</div>

					{#if !optedOut}
						<div class="form-grid" style="margin-top: 20px;">
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
								/>
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
								/>
							</div>

							<div class="form-group full-width">
								<label for="fuzz">Privacy Offset: {fuzz}</label>
								<input 
									type="range" 
									id="fuzz" 
									name="fuzz" 
									bind:value={fuzz}
									min="-0.5"
									max="0.5"
									step="0.01"
								/>
								<p class="field-hint">Add a small offset to protect your exact location</p>
							</div>
						</div>

						<div class="help-box">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
								<line x1="12" y1="17" x2="12.01" y2="17"/>
							</svg>
							<span>Find your coordinates at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer">latlong.net</a></span>
						</div>

						{#if latitude && longitude}
							<a 
								href="https://hackclub.com/map#lat={latitude}&lng={longitude}&z=10"
								target="_blank"
								rel="noopener noreferrer"
								class="preview-link"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
									<polyline points="15 3 21 3 21 9"/>
									<line x1="10" y1="14" x2="21" y2="3"/>
								</svg>
								Preview on Map
							</a>
						{/if}
					{/if}

					<div class="form-actions">
						<button type="submit" class="btn-save" disabled={isMapSaving}>
							{#if isMapSaving}
								<span class="spinner"></span>
								Saving...
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
									<polyline points="17 21 17 13 7 13 7 21"/>
									<polyline points="7 3 7 8 15 8"/>
								</svg>
								Save Map Settings
							{/if}
						</button>
					</div>
				</form>
			</section>
		{/if}

		<!-- Team Management -->
		{#if activeTab === 'team'}
			<section class="settings-card animate-fadeInUp">
				<div class="card-header">
					<h2>Team Management</h2>
					<p>Invite others to help lead your club</p>
				</div>
				
				<div class="team-section">
					<div class="invite-card">
						<div class="invite-icon">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
								<circle cx="8.5" cy="7" r="4"/>
								<line x1="20" y1="8" x2="20" y2="14"/>
								<line x1="23" y1="11" x2="17" y2="11"/>
							</svg>
						</div>
						<div class="invite-content">
							<h3>Invite a Co-Leader</h3>
							<p>Share the responsibility of running your club with another leader. They'll have access to manage events, members, and settings.</p>
						</div>
						<button class="btn-invite" onclick={() => showInviteModal = true}>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="12" y1="5" x2="12" y2="19"/>
								<line x1="5" y1="12" x2="19" y2="12"/>
							</svg>
							Invite Co-Leader
						</button>
					</div>
				</div>

				{#if club.leaders && club.leaders.length > 0}
					<div class="team-list">
						<h3>Current Leaders</h3>
						<div class="members-grid">
							{#each club.leaders as leader}
								<div class="member-card leader">
									<div class="member-avatar">
										{typeof leader === 'string' ? leader.charAt(0).toUpperCase() : (leader.name ? leader.name.charAt(0).toUpperCase() : 'L')}
									</div>
									<div class="member-info">
										<span class="member-name">{typeof leader === 'string' ? leader : (leader.name || 'Leader')}</span>
										{#if typeof leader === 'object' && leader.email}
											<span class="member-email">{leader.email}</span>
										{/if}
									</div>
									<span class="leader-badge">Leader</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>

<!-- Dormant Warning Modal -->
{#if showDormantWarning}
	<div class="modal-overlay" role="dialog" aria-modal="true">
		<div class="modal warning-modal">
			<div class="modal-icon warning">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
					<line x1="12" y1="9" x2="12" y2="13"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
			</div>
			<h3>Make Club Dormant?</h3>
			<p>Are you sure you want to set your club to <strong>Dormant</strong>?</p>
			<p class="warning-text">This action will close your club and <strong>cannot be undone</strong>.</p>
			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={cancelDormant}>Cancel</button>
				<button type="button" class="btn-danger" onclick={confirmDormant}>Yes, Make Dormant</button>
			</div>
		</div>
	</div>
{/if}

<!-- Invite Co-Leader Modal -->
<InviteCoLeaderModal 
	bind:open={showInviteModal} 
	clubId={club.id} 
	clubName={club.name} 
/>

<style>
	.manage-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 24px;
	}

	/* Header */
	.page-header {
		margin-bottom: 24px;
	}

	.header-top {
		margin-bottom: 16px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: #338eda;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #2a7bc5;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.header-icon {
		width: 56px;
		height: 56px;
		background: #ec3750;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.page-header h1 {
		margin: 0;
		font-size: 28px;
		color: #1f2d3d;
	}

	.subtitle {
		margin: 4px 0 0;
		color: #8492a6;
		font-size: 15px;
	}

	/* Tab Navigation */
	.tab-nav {
		display: flex;
		gap: 4px;
		background: #f9fafc;
		padding: 4px;
		border-radius: 12px;
		margin-bottom: 24px;
		overflow-x: auto;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: transparent;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #8492a6;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.tab-btn:hover {
		color: #1f2d3d;
		background: white;
	}

	.tab-btn.active {
		background: white;
		color: #ec3750;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Settings Card */
	.settings-card {
		background: white;
		border: 2px solid #e0e6ed;
		border-radius: 16px;
		padding: 24px;
	}

	.card-header {
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 1px solid #e0e6ed;
	}

	.card-header h2 {
		margin: 0 0 4px;
		font-size: 20px;
		color: #1f2d3d;
	}

	.card-header p {
		margin: 0;
		color: #8492a6;
		font-size: 14px;
	}

	.card-header a {
		color: #338eda;
		text-decoration: none;
	}

	.card-header a:hover {
		text-decoration: underline;
	}

	/* Form */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 20px;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 8px;
	}

	.form-group input,
	.form-group select {
		padding: 12px 14px;
		border: 2px solid #e0e6ed;
		border-radius: 10px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #338eda;
		box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
	}

	.form-group input:disabled,
	.form-group select:disabled {
		background: #f9fafc;
		color: #8492a6;
		cursor: not-allowed;
	}

	.form-group input[type="range"] {
		padding: 0;
		border: none;
		height: 6px;
		border-radius: 3px;
		background: #e0e6ed;
		cursor: pointer;
	}

	.field-hint {
		font-size: 12px;
		color: #8492a6;
		margin-top: 6px;
	}

	.link-preview {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		padding: 10px 14px;
		background: #e6f4ff;
		border-radius: 8px;
		font-size: 13px;
	}

	.link-label {
		color: #1f2d3d;
		font-weight: 500;
	}

	.link-preview a {
		color: #338eda;
		text-decoration: none;
		font-weight: 600;
	}

	.link-preview a:hover {
		text-decoration: underline;
	}

	/* Status Badge */
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 500;
	}

	.status-badge.dormant {
		background: #fef3f4;
		color: #ec3750;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: currentColor;
	}

	/* Chip Group */
	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.chip {
		padding: 8px 14px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.chip:hover {
		border-color: #338eda;
		background: #e6f4ff;
	}

	.chip.selected {
		background: #338eda;
		border-color: #338eda;
		color: white;
	}

	/* Radio Cards */
	.radio-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.radio-card {
		padding: 10px 16px;
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.radio-card input {
		display: none;
	}

	.radio-card:hover {
		border-color: #338eda;
	}

	.radio-card.selected {
		background: #e6f4ff;
		border-color: #338eda;
	}

	.radio-label {
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
	}

	/* Visibility Toggle */
	.visibility-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		background: #e8f5e9;
		border: 2px solid #33d6a6;
		border-radius: 12px;
		transition: all 0.2s;
	}

	.visibility-toggle.hidden {
		background: #fef3f4;
		border-color: #ec3750;
	}

	.toggle-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.toggle-icon {
		color: #33d6a6;
	}

	.visibility-toggle.hidden .toggle-icon {
		color: #ec3750;
	}

	.toggle-title {
		display: block;
		font-weight: 600;
		color: #1f2d3d;
		font-size: 14px;
	}

	.toggle-desc {
		display: block;
		font-size: 12px;
		color: #8492a6;
		margin-top: 2px;
	}

	/* Switch */
	.switch {
		position: relative;
		width: 48px;
		height: 26px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #33d6a6;
		transition: 0.3s;
		border-radius: 26px;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 20px;
		width: 20px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.3s;
		border-radius: 50%;
	}

	.switch input:checked + .slider {
		background-color: #ec3750;
	}

	.switch input:checked + .slider:before {
		transform: translateX(22px);
	}

	/* Help Box */
	.help-box {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: #f9fafc;
		border-radius: 10px;
		font-size: 13px;
		color: #8492a6;
		margin-top: 16px;
	}

	.help-box a {
		color: #338eda;
		font-weight: 500;
	}

	/* Preview Link */
	.preview-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
		padding: 10px 16px;
		background: #e6f4ff;
		color: #338eda;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.preview-link:hover {
		background: #338eda;
		color: white;
	}

	/* Form Actions */
	.form-actions {
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid #e0e6ed;
		display: flex;
		justify-content: flex-end;
	}

	.btn-save {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: #33d6a6;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
	}

	.btn-save:hover:not(:disabled) {
		background: #2bc095;
		transform: translateY(-2px);
	}

	.btn-save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Team Section */
	.team-section {
		margin-bottom: 24px;
	}

	.invite-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 24px;
		background: #f0fdf9;
		border: 2px dashed #33d6a6;
		border-radius: 14px;
	}

	.invite-icon {
		width: 64px;
		height: 64px;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #33d6a6;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(51, 214, 166, 0.2);
	}

	.invite-content {
		flex: 1;
	}

	.invite-content h3 {
		margin: 0 0 6px;
		font-size: 18px;
		color: #1f2d3d;
	}

	.invite-content p {
		margin: 0;
		font-size: 14px;
		color: #8492a6;
		line-height: 1.5;
	}

	.btn-invite {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-invite:hover {
		background: #d32f44;
		transform: translateY(-2px);
	}

	/* Team List */
	.team-list h3 {
		font-size: 16px;
		color: #1f2d3d;
		margin: 0 0 16px;
	}

	.members-grid {
		display: grid;
		gap: 12px;
	}

	.member-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		background: #f9fafc;
		border-radius: 12px;
	}

	.member-avatar {
		width: 44px;
		height: 44px;
		background: #ec3750;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 16px;
	}

	.member-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.member-name {
		font-weight: 600;
		color: #1f2d3d;
		font-size: 14px;
	}

	.member-email {
		font-size: 13px;
		color: #8492a6;
	}

	.leader-badge {
		padding: 4px 10px;
		background: rgba(236, 55, 80, 0.1);
		color: #ec3750;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
	}

	/* Warning Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: white;
		border-radius: 16px;
		padding: 32px;
		max-width: 420px;
		width: 100%;
		text-align: center;
	}

	.modal-icon {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
	}

	.modal-icon.warning {
		background: #fef3f4;
		color: #ec3750;
	}

	.modal h3 {
		margin: 0 0 12px;
		font-size: 20px;
		color: #1f2d3d;
	}

	.modal p {
		margin: 0 0 8px;
		color: #8492a6;
		font-size: 14px;
		line-height: 1.5;
	}

	.warning-text {
		color: #ec3750 !important;
		font-weight: 500;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-top: 24px;
	}

	.btn-secondary,
	.btn-danger {
		padding: 12px 24px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: #f9fafc;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
	}

	.btn-secondary:hover {
		background: #e0e6ed;
	}

	.btn-danger {
		background: #ec3750;
		color: white;
		border: none;
	}

	.btn-danger:hover {
		background: #d62c47;
	}

	/* Animations */
	.animate-fadeInUp {
		animation: fadeInUp 0.4s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.manage-page {
			padding: 16px;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.invite-card {
			flex-direction: column;
			text-align: center;
		}

		.tab-nav {
			gap: 2px;
			padding: 3px;
		}

		.tab-btn {
			padding: 8px 12px;
			font-size: 13px;
		}

		.tab-btn span {
			display: none;
		}
	}
</style>
