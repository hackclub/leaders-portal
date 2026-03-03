<script>
	import { page } from '$app/stores';

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
			saveSuccess = 'Profile updated successfully!';
			setTimeout(() => saveSuccess = '', 3000);
		} catch (err) {
			saveError = err.message;
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Club Leaders Portal</title>
</svelte:head>

<div class="container">
	<div class="settings-card">
		<div class="header">
			<a href="/" class="back-link">← Back to Home</a>
			<h1 class="title">Settings</h1>
		</div>

		{#if successMessage === 'linked'}
			<div class="success-banner">
				Successfully linked your Hack Club account.
			</div>
		{/if}

		{#if errorMessage === 'already_linked'}
			<div class="error-banner">
				This Hack Club account is already linked to another user.
			</div>
		{/if}

		{#if saveSuccess}
			<div class="success-banner">{saveSuccess}</div>
		{/if}

		{#if saveError}
			<div class="error-banner">{saveError}</div>
		{/if}

		<section class="section">
			<h2 class="section-title">Account Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="label">Email</span>
					<span class="value">{data.user.email || 'Not set'}</span>
				</div>
				{#if data.user.firstName || data.user.lastName}
					<div class="info-item">
						<span class="label">Name</span>
						<span class="value">{data.user.firstName || ''} {data.user.lastName || ''}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="label">Login Method</span>
					<span class="value">{data.user.provider === 'hackclub_auth' ? 'Hack Club Auth' : data.user.provider === 'email' ? 'Email OTP' : data.user.provider}</span>
				</div>
			</div>
		</section>

		<section class="section">
			<h2 class="section-title">OAuth Tools</h2>
			<p class="developer-copy">
				You can manage your OAuth2 applications here
			</p>
			<a href="/oauth/applications" class="btn">Manage OAuth Applications</a>
		</section>

		{#if data.leaderProfile}
			<section class="section">
				<div class="section-header">
					<h2 class="section-title">Leader Profile</h2>
					{#if !isEditing}
						<button class="btn btn-secondary" onclick={startEditing}>Edit Profile</button>
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

		<section class="section">
			<h2 class="section-title">Hack Club Account</h2>
			
			{#if data.user.hackclubAuthId}
				<div class="linked-status">
					<div class="linked-badge">
						<img src="https://icons.hackclub.com/api/icons/0x16a34a/checkmark" alt="Linked" width="20" height="20" />
						Linked
					</div>
					<p class="linked-info">Your account is linked to Hack Club Auth.</p>
				</div>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">Hack Club ID</span>
						<span class="value">{data.user.hackclubAuthId}</span>
					</div>
					{#if data.user.hackclubPrimaryEmail}
						<div class="info-item">
							<span class="label">Hack Club Email</span>
							<span class="value">{data.user.hackclubPrimaryEmail}</span>
						</div>
					{/if}
					{#if data.user.hackclubSlackId}
						<div class="info-item">
							<span class="label">Slack ID</span>
							<span class="value">{data.user.hackclubSlackId}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="unlinked-status">
					<p>Link your Hack Club account to enable additional features and use your Hack Club identity for club management.</p>
					<a href="/auth/link" class="btn link-button">
						<img src="https://icons.hackclub.com/api/icons/white/github" alt="GitHub" width="20" height="20" />
						Link Hack Club Account
					</a>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	:global(body) {
		background-color: var(--white);
		color: var(--black);
		margin: 0;
		padding: 0;
	}

	.container {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 48px 16px;
		box-sizing: border-box;
	}

	.settings-card {
		background: white;
		border: 3px solid #e0e6ed;
		border-radius: 16px;
		padding: 48px;
		max-width: 700px;
		width: 100%;
		box-sizing: border-box;
	}

	.header {
		margin-bottom: 32px;
	}

	.back-link {
		color: #ec3750;
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		display: inline-block;
		margin-bottom: 16px;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.title {
		font-size: 32px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
	}

	.section {
		margin-bottom: 32px;
		padding-bottom: 32px;
		border-bottom: 1px solid #e0e6ed;
	}

	.section:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
		margin-bottom: 12px;
	}

	.section-header .section-title {
		margin-bottom: 0;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #f9fafc;
		border-radius: 8px;
	}

	.address-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.address-item .value {
		line-height: 1.5;
	}

	.label {
		color: #8492a6;
		font-size: 14px;
		font-weight: 600;
	}

	.value {
		color: #1f2d3d;
		font-size: 14px;
	}

	.link-value {
		color: #338eda;
		font-size: 14px;
		text-decoration: none;
		word-break: break-all;
	}

	.link-value:hover {
		text-decoration: underline;
	}

	.linked-status {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
		padding: 16px;
		background-color: #dcfce7;
		border-radius: 8px;
	}

	.linked-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #16a34a;
		font-weight: 600;
		font-size: 14px;
	}

	.linked-info {
		color: #166534;
		font-size: 14px;
		margin: 0;
	}

	.unlinked-status {
		padding: 16px;
		background-color: #f9fafc;
		border-radius: 8px;
	}

	.unlinked-status p {
		margin: 0 0 16px 0;
		color: #8492a6;
		font-size: 14px;
		line-height: 1.5;
	}

	.developer-copy {
		margin-top: 0;
		margin-bottom: 14px;
		color: #5b6878;
		font-size: 14px;
		line-height: 1.5;
	}

	.link-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.success-banner {
		background-color: #dcfce7;
		border: 1px solid #16a34a;
		color: #166534;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
	}

	.error-banner {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
	}

	.btn {
		background-color: #ec3750;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: #f9fafc;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #e0e6ed;
	}

	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-section-title {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
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

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
	}

	.form-group input,
	.form-group select {
		padding: 10px 12px;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 14px;
		color: #1f2d3d;
		background-color: white;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #338eda;
	}

	.custom-pronouns-input {
		margin-top: 8px;
	}

	.disabled-field {
		opacity: 0.7;
	}

	.disabled-field label {
		color: #8492a6;
	}

	.locked-badge {
		display: inline-block;
		background-color: #8492a6;
		color: white;
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		vertical-align: middle;
	}

	.disabled-input {
		background-color: #e8e8e8;
		color: #8492a6;
		cursor: not-allowed;
		border-color: #d0d0d0;
	}

	.field-hint {
		font-size: 12px;
		color: #8492a6;
		margin-top: 4px;
		font-style: italic;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
	}

	.profile-view {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.profile-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.profile-section-title {
		font-size: 14px;
		font-weight: 600;
		color: #8492a6;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style>
