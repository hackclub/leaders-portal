<script>
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast.js';

	let { data } = $props();

	let successMessage = $derived($page.url.searchParams.get('success'));
	let errorMessage = $derived($page.url.searchParams.get('error'));

	let isEditing = $state(false);
	let isSaving = $state(false);
	let saveError = $state('');
	let saveSuccess = $state('');

	const pronounOptions = ['he/him', 'she/her', 'they/them', 'it/its', 'any/all'];
	const genderOptions = ['Female', 'Male', 'Non-binary/non-confirming'];

	let formData = $state({
		firstName: data.leaderProfile?.firstName || '',
		lastName: data.leaderProfile?.lastName || '',
		pronouns: data.leaderProfile?.pronouns || '',
		customPronouns: '',
		gender: data.leaderProfile?.gender || '',
		email: data.leaderProfile?.email || '',
		phoneNumber: data.leaderProfile?.phoneNumber || '',
		addressLine1: data.leaderProfile?.addressLine1 || '',
		addressLine2: data.leaderProfile?.addressLine2 || '',
		addressCity: data.leaderProfile?.addressCity || '',
		addressState: data.leaderProfile?.addressState || '',
		addressCountry: data.leaderProfile?.addressCountry || '',
		addressZipCode: data.leaderProfile?.addressZipCode || '',
		linkGithub: data.leaderProfile?.linkGithub || '',
		linkPersonalWebsite: data.leaderProfile?.linkPersonalWebsite || '',
		linkSocialMedia: data.leaderProfile?.linkSocialMedia || ''
	});

	let isCustomPronouns = $derived(
		formData.pronouns && !pronounOptions.includes(formData.pronouns)
	);

	function startEditing() {
		formData = {
			firstName: data.leaderProfile?.firstName || '',
			lastName: data.leaderProfile?.lastName || '',
			pronouns: data.leaderProfile?.pronouns || '',
			customPronouns: '',
			gender: data.leaderProfile?.gender || '',
			email: data.leaderProfile?.email || '',
			phoneNumber: data.leaderProfile?.phoneNumber || '',
			addressLine1: data.leaderProfile?.addressLine1 || '',
			addressLine2: data.leaderProfile?.addressLine2 || '',
			addressCity: data.leaderProfile?.addressCity || '',
			addressState: data.leaderProfile?.addressState || '',
			addressCountry: data.leaderProfile?.addressCountry || '',
			addressZipCode: data.leaderProfile?.addressZipCode || '',
			linkGithub: data.leaderProfile?.linkGithub || '',
			linkPersonalWebsite: data.leaderProfile?.linkPersonalWebsite || '',
			linkSocialMedia: data.leaderProfile?.linkSocialMedia || ''
		};
		
		if (data.leaderProfile?.pronouns && !pronounOptions.includes(data.leaderProfile.pronouns)) {
			formData.pronouns = 'other';
			formData.customPronouns = data.leaderProfile.pronouns;
		}
		
		isEditing = true;
		saveError = '';
		saveSuccess = '';
	}

	function cancelEditing() {
		isEditing = false;
		saveError = '';
	}

	async function saveProfile() {
		isSaving = true;
		saveError = '';
		saveSuccess = '';

		const updates = {
			first_name: formData.firstName,
			last_name: formData.lastName,
			pronouns: formData.pronouns === 'other' ? formData.customPronouns : formData.pronouns,
			gender: formData.gender || null,
			phone_number: formData.phoneNumber,
			address_line_1: formData.addressLine1,
			address_line_2: formData.addressLine2,
			address_city: formData.addressCity,
			address_state: formData.addressState,
			address_country: formData.addressCountry,
			address_zip_code: formData.addressZipCode,
			link_github: formData.linkGithub,
			link_personal_website: formData.linkPersonalWebsite,
			link_social_media: formData.linkSocialMedia
		};

		try {
			const response = await fetch('/api/user/profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || 'Failed to save profile');
			}

			if (data.leaderProfile) {
				data.leaderProfile.firstName = formData.firstName;
				data.leaderProfile.lastName = formData.lastName;
				data.leaderProfile.pronouns = formData.pronouns === 'other' ? formData.customPronouns : formData.pronouns;
				data.leaderProfile.gender = formData.gender;
				data.leaderProfile.phoneNumber = formData.phoneNumber;
				data.leaderProfile.addressLine1 = formData.addressLine1;
				data.leaderProfile.addressLine2 = formData.addressLine2;
				data.leaderProfile.addressCity = formData.addressCity;
				data.leaderProfile.addressState = formData.addressState;
				data.leaderProfile.addressCountry = formData.addressCountry;
				data.leaderProfile.addressZipCode = formData.addressZipCode;
				data.leaderProfile.linkGithub = formData.linkGithub;
				data.leaderProfile.linkPersonalWebsite = formData.linkPersonalWebsite;
				data.leaderProfile.linkSocialMedia = formData.linkSocialMedia;
			}

			isEditing = false;
			toasts.success('Profile updated successfully!');
		} catch (err) {
			toasts.error(err.message);
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Club Leaders Portal</title>
</svelte:head>

<div class="settings-page">
	<div class="settings-container">
		<header class="settings-header">
			<a href="/" class="back-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to Home
			</a>
			<h1 class="settings-title">Settings</h1>
			<p class="settings-subtitle">Manage your account and preferences</p>
		</header>

		{#if successMessage === 'linked'}
			<div class="alert alert-success">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
					<polyline points="22,4 12,14.01 9,11.01"/>
				</svg>
				Successfully linked your Hack Club account.
			</div>
		{/if}

		{#if errorMessage === 'already_linked'}
			<div class="alert alert-error">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="15" y1="9" x2="9" y2="15"/>
					<line x1="9" y1="9" x2="15" y2="15"/>
				</svg>
				This Hack Club account is already linked to another user.
			</div>
		{/if}

		{#if saveSuccess}
			<div class="alert alert-success">{saveSuccess}</div>
		{/if}

		{#if saveError}
			<div class="alert alert-error">{saveError}</div>
		{/if}

		<section class="settings-section card">
			<h2 class="section-title">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
					<circle cx="12" cy="7" r="4"/>
				</svg>
				Account Information
			</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Email</span>
					<span class="info-value">{data.user.email || 'Not set'}</span>
				</div>
				{#if data.user.firstName || data.user.lastName}
					<div class="info-item">
						<span class="info-label">Name</span>
						<span class="info-value">{data.user.firstName || ''} {data.user.lastName || ''}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="info-label">Login Method</span>
					<span class="info-value badge badge-info">{data.user.provider === 'hackclub_auth' ? 'Hack Club Auth' : data.user.provider === 'email' ? 'Email OTP' : data.user.provider}</span>
				</div>
			</div>
		</section>

		{#if data.leaderProfile}
			<section class="settings-section card">
				<div class="section-header">
					<h2 class="section-title">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="8.5" cy="7" r="4"/>
							<line x1="20" y1="8" x2="20" y2="14"/>
							<line x1="23" y1="11" x2="17" y2="11"/>
						</svg>
						Leader Profile
					</h2>
					{#if !isEditing}
						<button class="btn btn-secondary" onclick={startEditing}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
							</svg>
							Edit Profile
						</button>
					{/if}
				</div>

				{#if isEditing}
					<form class="edit-form" onsubmit={(e) => { e.preventDefault(); saveProfile(); }}>
						<div class="form-section">
							<h3 class="form-section-title">Personal Information</h3>
							
							<div class="form-row">
								<div class="form-group">
									<label for="firstName">First Name</label>
									<input type="text" id="firstName" bind:value={formData.firstName} maxlength="100" />
								</div>
								<div class="form-group">
									<label for="lastName">Last Name</label>
									<input type="text" id="lastName" bind:value={formData.lastName} maxlength="100" />
								</div>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="pronouns">Pronouns</label>
									<select id="pronouns" bind:value={formData.pronouns}>
										<option value="">Select pronouns...</option>
										{#each pronounOptions as option}
											<option value={option}>{option}</option>
										{/each}
										<option value="other">Other</option>
									</select>
									{#if formData.pronouns === 'other'}
										<input 
											type="text" 
											placeholder="Enter your pronouns" 
											bind:value={formData.customPronouns}
											maxlength="50"
											class="custom-pronouns-input"
										/>
									{/if}
								</div>
								<div class="form-group">
									<label for="gender">Gender</label>
									<select id="gender" bind:value={formData.gender}>
										<option value="">Select gender...</option>
										{#each genderOptions as option}
											<option value={option}>{option}</option>
										{/each}
									</select>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group disabled-field">
									<label for="email">Email </label>
									<span class="locked-badge">Locked</span>
									<input type="email" id="email" value={formData.email} disabled class="disabled-input" />
									<span class="field-hint">Contact Hack Club HQ if you need to change your email.</span>
								</div>
								<div class="form-group">
									<label for="phoneNumber">Phone Number</label>
									<input type="tel" id="phoneNumber" bind:value={formData.phoneNumber} maxlength="30" />
								</div>
							</div>
						</div>

						<div class="form-section">
							<h3 class="form-section-title">Address</h3>
							
							<div class="form-group full-width">
								<label for="addressLine1">Address Line 1</label>
								<input type="text" id="addressLine1" bind:value={formData.addressLine1} maxlength="200" />
							</div>

							<div class="form-group full-width">
								<label for="addressLine2">Address Line 2</label>
								<input type="text" id="addressLine2" bind:value={formData.addressLine2} maxlength="200" />
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="addressCity">City</label>
									<input type="text" id="addressCity" bind:value={formData.addressCity} maxlength="200" />
								</div>
								<div class="form-group">
									<label for="addressState">State/Province</label>
									<input type="text" id="addressState" bind:value={formData.addressState} maxlength="200" />
								</div>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="addressCountry">Country</label>
									<input type="text" id="addressCountry" bind:value={formData.addressCountry} maxlength="200" />
								</div>
								<div class="form-group">
									<label for="addressZipCode">Zip/Postal Code</label>
									<input type="text" id="addressZipCode" bind:value={formData.addressZipCode} maxlength="200" />
								</div>
							</div>
						</div>

						<div class="form-section">
							<h3 class="form-section-title">Links</h3>
							
							<div class="form-group full-width">
								<label for="linkGithub">GitHub</label>
								<input type="url" id="linkGithub" bind:value={formData.linkGithub} placeholder="https://github.com/username" />
							</div>

							<div class="form-group full-width">
								<label for="linkPersonalWebsite">Personal Website</label>
								<input type="url" id="linkPersonalWebsite" bind:value={formData.linkPersonalWebsite} placeholder="https://example.com" />
							</div>

							<div class="form-group full-width">
								<label for="linkSocialMedia">Social Media</label>
								<input type="url" id="linkSocialMedia" bind:value={formData.linkSocialMedia} placeholder="https://twitter.com/username" />
							</div>
						</div>

						<div class="form-actions">
							<button type="button" class="btn btn-secondary" onclick={cancelEditing} disabled={isSaving}>
								Cancel
							</button>
							<button type="submit" class="btn" disabled={isSaving}>
								{isSaving ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>
				{:else}
					<div class="profile-view">
						<div class="profile-section">
							<h3 class="profile-section-title">Personal Information</h3>
							<div class="info-grid">
								<div class="info-item">
									<span class="label">Name</span>
									<span class="value">{data.leaderProfile.firstName || ''} {data.leaderProfile.lastName || ''}</span>
								</div>
								{#if data.leaderProfile.pronouns}
									<div class="info-item">
										<span class="label">Pronouns</span>
										<span class="value">{data.leaderProfile.pronouns}</span>
									</div>
								{/if}
								{#if data.leaderProfile.gender}
									<div class="info-item">
										<span class="label">Gender</span>
										<span class="value">{data.leaderProfile.gender}</span>
									</div>
								{/if}
								<div class="info-item">
									<span class="label">Email</span>
									<span class="value">{data.leaderProfile.email}</span>
								</div>
								{#if data.leaderProfile.phoneNumber}
									<div class="info-item">
										<span class="label">Phone</span>
										<span class="value">{data.leaderProfile.phoneNumber}</span>
									</div>
								{/if}
							</div>
						</div>

						{#if data.leaderProfile.addressLine1 || data.leaderProfile.addressCity || data.leaderProfile.addressCountry}
							<div class="profile-section">
								<h3 class="profile-section-title">Address</h3>
								<div class="info-grid">
									<div class="info-item address-item">
										<span class="label">Address</span>
										<span class="value">
											{#if data.leaderProfile.addressLine1}{data.leaderProfile.addressLine1}<br/>{/if}
											{#if data.leaderProfile.addressLine2}{data.leaderProfile.addressLine2}<br/>{/if}
											{#if data.leaderProfile.addressCity}{data.leaderProfile.addressCity}{/if}{#if data.leaderProfile.addressState}, {data.leaderProfile.addressState}{/if} {data.leaderProfile.addressZipCode || ''}
											{#if data.leaderProfile.addressCountry}<br/>{data.leaderProfile.addressCountry}{/if}
										</span>
									</div>
								</div>
							</div>
						{/if}

						{#if data.leaderProfile.linkGithub || data.leaderProfile.linkPersonalWebsite || data.leaderProfile.linkSocialMedia}
							<div class="profile-section">
								<h3 class="profile-section-title">Links</h3>
								<div class="info-grid">
									{#if data.leaderProfile.linkGithub}
										<div class="info-item">
											<span class="label">GitHub</span>
											<a href={data.leaderProfile.linkGithub} target="_blank" rel="noopener noreferrer" class="link-value">{data.leaderProfile.linkGithub}</a>
										</div>
									{/if}
									{#if data.leaderProfile.linkPersonalWebsite}
										<div class="info-item">
											<span class="label">Website</span>
											<a href={data.leaderProfile.linkPersonalWebsite} target="_blank" rel="noopener noreferrer" class="link-value">{data.leaderProfile.linkPersonalWebsite}</a>
										</div>
									{/if}
									{#if data.leaderProfile.linkSocialMedia}
										<div class="info-item">
											<span class="label">Social Media</span>
											<a href={data.leaderProfile.linkSocialMedia} target="_blank" rel="noopener noreferrer" class="link-value">{data.leaderProfile.linkSocialMedia}</a>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</section>
		{/if}

		<section class="settings-section card">
			<h2 class="section-title">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
				</svg>
				Hack Club Account
			</h2>
			
			{#if data.user.hackclubAuthId}
				<div class="linked-status">
					<div class="status-badge success">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
							<polyline points="22,4 12,14.01 9,11.01"/>
						</svg>
						Linked
					</div>
					<p>Your account is linked to Hack Club Auth.</p>
				</div>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Hack Club ID</span>
						<span class="info-value code">{data.user.hackclubAuthId}</span>
					</div>
					{#if data.user.hackclubPrimaryEmail}
						<div class="info-item">
							<span class="info-label">Hack Club Email</span>
							<span class="info-value">{data.user.hackclubPrimaryEmail}</span>
						</div>
					{/if}
					{#if data.user.hackclubSlackId}
						<div class="info-item">
							<span class="info-label">Slack ID</span>
							<span class="info-value code">{data.user.hackclubSlackId}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="unlinked-status">
					<p>Link your Hack Club account to enable additional features and use your Hack Club identity for club management.</p>
					<a href="/auth/link" class="btn btn-primary">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
						</svg>
						Link Hack Club Account
					</a>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		background: var(--hc-snow, #f9fafc);
		padding: var(--space-6, 24px) var(--space-4, 16px);
	}

	.settings-container {
		max-width: 720px;
		margin: 0 auto;
	}

	/* Header */
	.settings-header {
		margin-bottom: var(--space-6, 24px);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2, 8px);
		color: var(--hc-red, #ec3750);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: var(--space-4, 16px);
		transition: color var(--transition-fast, 150ms ease);
	}

	.back-link:hover {
		color: var(--hc-red-dark, #d32f44);
	}

	.settings-title {
		font-size: 2.5rem;
		color: var(--hc-dark, #1f2d3d);
		margin: 0 0 var(--space-2, 8px) 0;
		letter-spacing: -0.03em;
	}

	.settings-subtitle {
		color: var(--hc-muted, #8492a6);
		margin: 0;
		font-size: 1rem;
	}

	/* Sections */
	.settings-section {
		margin-bottom: var(--space-6, 24px);
		padding: var(--space-6, 24px);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-5, 20px);
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--space-3, 12px);
		font-size: 1.25rem;
		color: var(--hc-dark, #1f2d3d);
		margin: 0 0 var(--space-5, 20px) 0;
	}

	.section-header .section-title {
		margin-bottom: 0;
	}

	/* Info Grid */
	.info-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 12px);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 12px) var(--space-4, 16px);
		background: var(--hc-snow, #f9fafc);
		border-radius: var(--radius-md, 8px);
	}

	.info-label {
		color: var(--hc-muted, #8492a6);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.info-value {
		color: var(--hc-dark, #1f2d3d);
		font-size: 0.875rem;
	}

	.info-value.code {
		font-family: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
		font-size: 0.8125rem;
		background: var(--hc-smoke, #e0e6ed);
		padding: var(--space-1, 4px) var(--space-2, 8px);
		border-radius: var(--radius-sm, 4px);
	}

	.link-value {
		color: var(--hc-blue, #338eda);
		font-size: 0.875rem;
		text-decoration: none;
		word-break: break-all;
	}

	.link-value:hover {
		text-decoration: underline;
	}

	/* Linked Status */
	.linked-status {
		display: flex;
		align-items: center;
		gap: var(--space-3, 12px);
		margin-bottom: var(--space-5, 20px);
		padding: var(--space-4, 16px);
		background: #dcfce7;
		border-radius: var(--radius-md, 8px);
		border: 2px solid var(--hc-green, #33d6a6);
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: var(--space-2, 8px);
		font-weight: 700;
		font-size: 0.875rem;
	}

	.status-badge.success {
		color: #166534;
	}

	.linked-status p {
		color: #166534;
		font-size: 0.875rem;
		margin: 0;
	}

	.unlinked-status {
		padding: var(--space-5, 20px);
		background: var(--hc-snow, #f9fafc);
		border-radius: var(--radius-md, 8px);
		border: 2px dashed var(--hc-smoke, #e0e6ed);
		text-align: center;
	}

	.unlinked-status p {
		margin: 0 0 var(--space-4, 16px) 0;
		color: var(--hc-muted, #8492a6);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Form Styles */
	.edit-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6, 24px);
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4, 16px);
	}

	.form-section-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--hc-muted, #8492a6);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4, 16px);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 8px);
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--hc-dark, #1f2d3d);
	}

	.form-group input,
	.form-group select {
		padding: var(--space-3, 12px) var(--space-4, 16px);
		border: 2px solid var(--hc-smoke, #e0e6ed);
		border-radius: var(--radius-md, 8px);
		font-size: 0.875rem;
		font-family: inherit;
		color: var(--hc-dark, #1f2d3d);
		background: var(--hc-white, #ffffff);
		transition: border-color var(--transition-fast, 150ms ease);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--hc-blue, #338eda);
	}

	.custom-pronouns-input {
		margin-top: var(--space-2, 8px);
	}

	.disabled-field {
		opacity: 0.7;
	}

	.disabled-field label {
		color: var(--hc-muted, #8492a6);
	}

	.locked-badge {
		display: inline-block;
		background: var(--hc-muted, #8492a6);
		color: var(--hc-white, #ffffff);
		font-size: 0.625rem;
		font-weight: 700;
		padding: var(--space-1, 4px) var(--space-2, 8px);
		border-radius: var(--radius-sm, 4px);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		vertical-align: middle;
		margin-left: var(--space-2, 8px);
	}

	.disabled-input {
		background: var(--hc-smoke, #e0e6ed);
		color: var(--hc-muted, #8492a6);
		cursor: not-allowed;
	}

	.field-hint {
		font-size: 0.75rem;
		color: var(--hc-muted, #8492a6);
		font-style: italic;
	}

	.form-actions {
		display: flex;
		gap: var(--space-3, 12px);
		justify-content: flex-end;
		padding-top: var(--space-4, 16px);
		border-top: 1px solid var(--hc-smoke, #e0e6ed);
	}

	/* Profile View */
	.profile-view {
		display: flex;
		flex-direction: column;
		gap: var(--space-6, 24px);
	}

	.profile-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 12px);
	}

	.profile-section-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--hc-muted, #8492a6);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.address-item {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2, 8px);
	}

	.address-item .info-value {
		line-height: 1.6;
	}

	/* Mobile Responsive */
	@media (max-width: 600px) {
		.settings-title {
			font-size: 2rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.settings-section {
			padding: var(--space-4, 16px);
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3, 12px);
		}

		.info-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2, 8px);
		}

		.form-actions {
			flex-direction: column;
		}

		.form-actions .btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
