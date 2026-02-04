<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import ConfirmModal from '$lib/ConfirmModal.svelte';
	import Modal from '$lib/Modal.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { toasts } from '$lib/stores/toast.js';
	
	let { data, form } = $props();
	let localClub = $state(null);
	let localAuthMembers = $state(null);
	
	// Use local state if set (from refresh), otherwise use data
	let club = $derived(localClub ?? data.club);
	let authenticatedMembers = $derived(localAuthMembers ?? data.authenticatedMembers ?? []);
	
	// Get emails of verified members to filter out from pending list
	let verifiedEmails = $derived(new Set(authenticatedMembers.map(m => m.email?.toLowerCase()).filter(Boolean)));
	
	// Pending members are in club.members (Airtable) but not verified through portal
	// club.members could be an array of strings (names) or array of objects
	let pendingMembers = $derived.by(() => {
		const members = club.members;
		if (!members) return [];
		if (!Array.isArray(members)) {
			// If it's an object, try to get values or return empty
			return Object.values(members).filter(m => typeof m === 'string');
		}
		// If array of objects, extract names; if array of strings, use as-is
		return members.map(m => typeof m === 'object' ? m.name || m.Name || String(m) : m);
	});

	function handleRefresh(refreshedClub) {
		localClub = mergeClubData(club, refreshedClub);
	}

	let showEditModal = $state(false);
	let editingMember = $state(null);
	let editName = $state('');
	let editEmail = $state('');
	let isEditing = $state(false);
	let isLoadingMember = $state(false);

	let showAddModal = $state(false);
	let newMemberName = $state('');
	let newMemberEmail = $state('');
	let isAdding = $state(false);

	// Remove confirm state
	let showRemoveConfirm = $state(false);
	let removeMemberName = $state(null);
	let removeFormRef = $state(null);

	// Remove authenticated member state
	let showRemoveAuthConfirm = $state(false);
	let removeAuthMember = $state(null);
	let removeAuthFormRef = $state(null);

	// Promote to co-leader state
	let showPromoteConfirm = $state(false);
	let promoteMember = $state(null);
	let promoteFormRef = $state(null);

	function openRemoveConfirm(memberName, formElement) {
		removeMemberName = memberName;
		removeFormRef = formElement;
		showRemoveConfirm = true;
	}

	function closeRemoveConfirm() {
		showRemoveConfirm = false;
		removeMemberName = null;
		removeFormRef = null;
	}

	function openRemoveAuthConfirm(member, formElement) {
		removeAuthMember = member;
		removeAuthFormRef = formElement;
		showRemoveAuthConfirm = true;
	}

	function closeRemoveAuthConfirm() {
		showRemoveAuthConfirm = false;
		removeAuthMember = null;
		removeAuthFormRef = null;
	}

	function handleRemoveAuthConfirm() {
		if (removeAuthFormRef) {
			removeAuthFormRef.submit();
		}
		closeRemoveAuthConfirm();
	}

	function handleRemoveConfirm() {
		if (removeFormRef) {
			removeFormRef.submit();
		}
		closeRemoveConfirm();
	}

	function openPromoteConfirm(member, formElement) {
		promoteMember = member;
		promoteFormRef = formElement;
		showPromoteConfirm = true;
	}

	function closePromoteConfirm() {
		showPromoteConfirm = false;
		promoteMember = null;
		promoteFormRef = null;
	}

	function handlePromoteConfirm() {
		if (promoteFormRef) {
			promoteFormRef.submit();
		}
		closePromoteConfirm();
	}

	async function openEditModal(memberName) {
		editingMember = memberName;
		editName = memberName;
		editEmail = '';
		isLoadingMember = true;
		showEditModal = true;

		const formData = new FormData();
		formData.append('memberName', memberName);

		try {
			const response = await fetch('?/getMemberInfo', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.data?.member?.email) {
				editEmail = result.data.member.email;
			}
		} catch (error) {
			console.error('Error fetching member info:', error);
		} finally {
			isLoadingMember = false;
		}
	}

	function closeEditModal() {
		showEditModal = false;
		editingMember = null;
		editName = '';
		editEmail = '';
		isEditing = false;
	}

	function openAddModal() {
		newMemberName = '';
		newMemberEmail = '';
		showAddModal = true;
	}

	function closeAddModal() {
		showAddModal = false;
		newMemberName = '';
		newMemberEmail = '';
		isAdding = false;
	}

	$effect(() => {
		if (form?.addSuccess) {
			toasts.success('Member added and invite email sent!');
			closeAddModal();
		}
		if (form?.editSuccess) {
			toasts.success('Member updated successfully!');
			closeEditModal();
		}
		if (form?.removeSuccess) {
			toasts.success('Member removed from club');
		}
		if (form?.promoteSuccess) {
			toasts.success(`${form.promotedEmail} is now a co-leader!`);
			// Remove from authenticated members list since they're now a leader
			authenticatedMembers = authenticatedMembers.filter(m => m.email !== form.promotedEmail);
		}
		if (form?.error) {
			toasts.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Members - {club.name} - Hack Club</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club/{encodeURIComponent(club.name)}" class="back-link">← Back to {club.name}</a>
			<h1 class="page-title">Members</h1>
			<p class="page-subtitle">{authenticatedMembers.length + pendingMembers.length} total members</p>
		</div>
		<div class="header-buttons">
			<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
			{#if club.role === 'leader'}
				<button type="button" class="primary-btn" onclick={openAddModal}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="8.5" cy="7" r="4"/>
						<line x1="20" y1="8" x2="20" y2="14"/>
						<line x1="23" y1="11" x2="17" y2="11"/>
					</svg>
					Invite Member
				</button>
			{/if}
		</div>
	</header>

	{#if club.joinCode}
		<div class="info-banner">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
			</svg>
			<span>Invite new members:</span>
			<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="invite-link">
				hack.club/join/{club.joinCode}
			</a>
		</div>
	{/if}

	<section class="members-section">
		<!-- Authenticated Members (from portal) -->
		{#if authenticatedMembers.length > 0}
			<h3 class="section-title">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
					<polyline points="22 4 12 14.01 9 11.01"/>
				</svg>
				Verified Members
				<span class="member-count">{authenticatedMembers.length}</span>
			</h3>
			<p class="section-description">Members who joined with a Hack Club account</p>
			<div class="members-grid">
				{#each authenticatedMembers as member}
					<div class="member-card verified">
						<div class="member-avatar verified">{member.name.charAt(0).toUpperCase()}</div>
						<div class="member-info">
							<span class="member-name">{member.name}</span>
							{#if member.email}
								<span class="member-email">{member.email}</span>
							{/if}
							<span class="member-joined">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
						</div>
						{#if club.role === 'leader'}
							<div class="member-actions">
								<form method="POST" action="?/promoteToCoLeader" class="action-form">
									<input type="hidden" name="membershipId" value={member.id} />
									<button type="button" class="promote-btn" title="Promote to Co-Leader" onclick={(e) => { e.preventDefault(); openPromoteConfirm(member, e.target.closest('form')); }}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M12 20V10"/>
											<path d="m18 14-6-6-6 6"/>
											<circle cx="12" cy="6" r="2"/>
										</svg>
									</button>
								</form>
								<form method="POST" action="?/removeAuthenticatedMember" class="action-form">
									<input type="hidden" name="membershipId" value={member.id} />
									<button type="button" class="remove-btn" title="Remove member" onclick={(e) => { e.preventDefault(); openRemoveAuthConfirm(member, e.target.closest('form')); }}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<line x1="18" y1="6" x2="6" y2="18"/>
											<line x1="6" y1="6" x2="18" y2="18"/>
										</svg>
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Pending/Invited Members (from Airtable, not yet verified) -->
		{#if pendingMembers.length > 0}
			<h3 class="section-title pending">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<polyline points="12 6 12 12 16 14"/>
				</svg>
				Pending Invites
				<span class="member-count pending">{pendingMembers.length}</span>
			</h3>
			<p class="section-description">Members who have been invited but haven't created an account yet</p>
			<div class="members-grid">
				{#each pendingMembers as member}
					<div class="member-card pending">
						<div class="member-avatar pending">{member.charAt(0).toUpperCase()}</div>
						<div class="member-info">
							<span class="member-name">{member}</span>
							<span class="member-status pending">Invite sent</span>
						</div>
						{#if club.role === 'leader'}
							<button type="button" class="edit-btn" title="Edit member" onclick={() => openEditModal(member)}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
									<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
								</svg>
							</button>
							<form method="POST" action="?/removeMember" class="remove-form">
								<input type="hidden" name="memberName" value={member} />
								<button type="button" class="remove-btn" title="Remove member" onclick={(e) => { e.preventDefault(); openRemoveConfirm(member, e.target.closest('form')); }}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="18" y1="6" x2="6" y2="18"/>
										<line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
								</button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		{#if authenticatedMembers.length === 0 && pendingMembers.length === 0}
			<div class="empty-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
					<circle cx="9" cy="7" r="4"/>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
				</svg>
				<h3>No members yet</h3>
				<p>Share your invite link to get started!</p>
				{#if club.joinCode}
					<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="empty-link">
						hack.club/join/{club.joinCode}
					</a>
				{/if}
			</div>
		{/if}
	</section>
</div>

<!-- Edit Member Modal -->
<Modal open={showEditModal} title="Edit Member" onClose={closeEditModal}>
	<form method="POST" action="?/editMember" onsubmit={() => isEditing = true}>
		<input type="hidden" name="memberName" value={editingMember} />
		
		{#if isLoadingMember}
			<div class="loading-text">Loading member info...</div>
		{/if}
		
		<div class="form-group">
			<label for="editName">Name</label>
			<input
				type="text"
				id="editName"
				name="newName"
				bind:value={editName}
				placeholder="Member name"
				required
			/>
		</div>
		
		<div class="form-group">
			<label for="editEmail">Email</label>
			<input
				type="email"
				id="editEmail"
				name="newEmail"
				bind:value={editEmail}
				placeholder="Member email"
			/>
		</div>
		
		<div class="modal-actions">
			<button type="button" class="cancel-btn" onclick={closeEditModal}>Cancel</button>
			<button type="submit" class="save-btn" disabled={isEditing || isLoadingMember}>
				{isEditing ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</form>
</Modal>

<!-- Add Member Modal -->
<Modal open={showAddModal} title="Invite New Member" onClose={closeAddModal}>
	<form method="POST" action="?/addMember" onsubmit={() => isAdding = true}>
		<p class="modal-description">Add a new member to your club. They'll receive an email invitation with a link to join.</p>
		
		<div class="form-group">
			<label for="newName">Name <span class="required">*</span></label>
			<input
				type="text"
				id="newName"
				name="name"
				bind:value={newMemberName}
				placeholder="Member name"
				required
			/>
		</div>
		
		<div class="form-group">
			<label for="newEmail">Email <span class="required">*</span></label>
			<input
				type="email"
				id="newEmail"
				name="email"
				bind:value={newMemberEmail}
				placeholder="Member email"
				required
			/>
		</div>
		
		<div class="modal-actions">
			<button type="button" class="cancel-btn" onclick={closeAddModal}>Cancel</button>
			<button type="submit" class="save-btn" disabled={isAdding || !newMemberName.trim() || !newMemberEmail.trim()}>
				{isAdding ? 'Sending Invite...' : 'Send Invite'}
			</button>
		</div>
	</form>
</Modal>

<!-- Remove Member Confirmation Modal -->
<ConfirmModal 
	open={showRemoveConfirm}
	title="Remove Member"
	message={`Are you sure you want to remove ${removeMemberName} from the club?`}
	confirmText="Remove"
	variant="danger"
	onConfirm={handleRemoveConfirm}
	onCancel={closeRemoveConfirm}
/>

<!-- Remove Authenticated Member Confirmation Modal -->
<ConfirmModal 
	open={showRemoveAuthConfirm}
	title="Remove Member"
	message={`Are you sure you want to remove ${removeAuthMember?.name} from the club? They will no longer be able to see announcements or events.`}
	confirmText="Remove"
	variant="danger"
	onConfirm={handleRemoveAuthConfirm}
	onCancel={closeRemoveAuthConfirm}
/>

<!-- Promote to Co-Leader Confirmation Modal -->
<ConfirmModal 
	open={showPromoteConfirm}
	title="Promote to Co-Leader"
	message={`Are you sure you want to promote ${promoteMember?.name} to co-leader? They will have full access to manage ${club.name}, including adding/removing members, sending announcements, and creating events.`}
	confirmText="Promote"
	variant="primary"
	onConfirm={handlePromoteConfirm}
	onCancel={closePromoteConfirm}
/>

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
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 16px;
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
		font-weight: 500;
		transition: color 0.15s ease;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 32px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
	}

	.page-subtitle {
		font-size: 16px;
		color: #8492a6;
		font-weight: 500;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
		transition: background 0.15s ease;
	}

	.primary-btn:hover {
		background: #d32d44;
	}

	.info-banner {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 8px;
		padding: 14px 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
		color: #0369a1;
	}

	.info-banner svg {
		flex-shrink: 0;
	}

	.invite-link {
		font-weight: 600;
		color: #0369a1;
		text-decoration: none;
		word-break: break-all;
	}

	.invite-link:hover {
		text-decoration: underline;
	}

	.members-section {
		margin-top: 8px;
	}

	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 12px;
	}

	.member-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.member-card:hover {
		border-color: #d1d5db;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.member-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: #ec3750;
		color: white;
		border-radius: 50%;
		font-size: 18px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.member-info {
		flex: 1;
		min-width: 0;
	}

	.member-name {
		font-size: 15px;
		font-weight: 600;
		color: #1f2d3d;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.member-email {
		font-size: 13px;
		color: #6b7280;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.member-joined {
		font-size: 12px;
		color: #9ca3af;
		display: block;
		margin-top: 2px;
	}

	.member-card.verified {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.04);
	}

	.member-avatar.verified {
		background: #10b981;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.section-title.pending {
		margin-top: 32px;
	}

	.section-title svg {
		color: #10b981;
	}

	.section-title.pending svg {
		color: #f59e0b;
	}

	.member-count {
		background: #f3f4f6;
		color: #374151;
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
	}

	.member-count.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.section-description {
		font-size: 13px;
		color: #6b7280;
		margin: 0 0 16px 0;
	}

	.member-card.pending {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.04);
	}

	.member-avatar.pending {
		background: #f59e0b;
	}

	.member-status {
		font-size: 12px;
		color: #6b7280;
	}

	.member-status.pending {
		color: #d97706;
		font-weight: 500;
	}

	.member-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}

	.action-form {
		display: contents;
	}

	.edit-btn,
	.remove-btn,
	.promote-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		color: #9ca3af;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.edit-btn:hover {
		background: #338eda;
		border-color: #338eda;
		color: white;
	}

	.promote-btn:hover {
		background: #10b981;
		border-color: #10b981;
		color: white;
	}

	.remove-form {
		display: contents;
	}

	.remove-btn:hover {
		background: #ec3750;
		border-color: #ec3750;
		color: white;
	}

	.empty-state {
		background: #f9fafb;
		padding: 48px 24px;
		border-radius: 12px;
		border: 2px dashed #e5e7eb;
		text-align: center;
	}

	.empty-state svg {
		color: #9ca3af;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		font-size: 18px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 8px 0;
	}

	.empty-state p {
		color: #6b7280;
		font-size: 15px;
		margin: 0;
	}

	.empty-link {
		display: inline-block;
		margin-top: 16px;
		padding: 10px 20px;
		background: #ec3750;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		transition: background 0.15s ease;
	}

	.empty-link:hover {
		background: #d32d44;
	}

	/* Modal form styles */
	.form-group {
		margin-bottom: 16px;
	}

	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin-bottom: 6px;
	}

	.form-group .required {
		color: #ec3750;
	}

	.form-group input[type="text"],
	.form-group input[type="email"] {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		font-family: 'Phantom Sans', sans-serif;
		box-sizing: border-box;
		transition: border-color 0.15s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: #ec3750;
	}

	.loading-text {
		color: #6b7280;
		font-size: 14px;
		margin-bottom: 16px;
	}

	.modal-description {
		color: #6b7280;
		font-size: 14px;
		line-height: 1.5;
		margin: 0 0 20px 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid #e5e7eb;
	}

	.cancel-btn {
		padding: 10px 20px;
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
		transition: all 0.15s ease;
	}

	.cancel-btn:hover {
		background: #f3f4f6;
	}

	.save-btn {
		padding: 10px 20px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
		transition: background 0.15s ease;
	}

	.save-btn:hover:not(:disabled) {
		background: #d32d44;
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		header {
			flex-direction: column;
		}

		.header-buttons {
			width: 100%;
			justify-content: flex-start;
		}

		.members-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
