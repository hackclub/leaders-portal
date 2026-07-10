<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import SiteNav from '$lib/SiteNav.svelte';
	import ClubHeader from '$lib/ClubHeader.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { deserialize } from '$app/forms';
	
	let { data, form } = $props();
	let club = $state(data.club);
	let leaders = $state(data.leaders || []);
	let coleaders = $state(data.coleaders || []);


	function handleRefresh(refreshedClub) {
		club = mergeClubData(club, refreshedClub);
	}

	let showAnnouncementModal = $state(false);
	let announcementMessage = $state('');
	let isSending = $state(false);

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

	let showDetailsModal = $state(false);
	let detailsMemberName = $state('');
	let detailsMemberEmail = $state('');
	let detailsShips = $state([]);
	let isLoadingDetails = $state(false);

	let detailsTotalHours = $derived(
		detailsShips.reduce((sum, ship) => sum + (Number(ship.hoursSpent) || 0), 0)
	);

	async function openDetailsModal(memberName) {
		detailsMemberName = memberName;
		detailsMemberEmail = data.memberEmails?.[memberName] || '';
		detailsShips = [];
		isLoadingDetails = true;
		showDetailsModal = true;

		const formData = new FormData();
		formData.append('memberName', memberName);

		try {
			const response = await fetch('?/getMemberDetails', {
				method: 'POST',
				body: formData
			});
			const result = deserialize(await response.text());
			if (result.type === 'success' && result.data?.success) {
				detailsMemberEmail = result.data.member?.email || detailsMemberEmail;
				detailsShips = result.data.ships || [];
			}
		} catch (error) {
			console.error('Error fetching member details:', error);
		} finally {
			isLoadingDetails = false;
		}
	}

	function closeDetailsModal() {
		showDetailsModal = false;
		detailsMemberName = '';
		detailsMemberEmail = '';
		detailsShips = [];
		isLoadingDetails = false;
	}

	function confirmRemove(event, memberName) {
		if (!confirm(`Remove ${memberName} from the club?`)) {
			event.preventDefault();
		}
	}

	function openAnnouncementModal() {
		announcementMessage = '';
		showAnnouncementModal = true;
	}

	function closeAnnouncementModal() {
		showAnnouncementModal = false;
		announcementMessage = '';
	}

	async function openEditModal(memberName) {
		editingMember = memberName;
		editName = memberName;
		editEmail = data.memberEmails?.[memberName] || '';
		showEditModal = true;

		// Email is preloaded during page load; only fetch if it's missing.
		if (editEmail) {
			return;
		}

		isLoadingMember = true;
		const formData = new FormData();
		formData.append('memberName', memberName);

		try {
			const response = await fetch('?/getMemberInfo', {
				method: 'POST',
				body: formData
			});
			const result = deserialize(await response.text());
			if (result.type === 'success' && result.data?.member?.email) {
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
</script>

<svelte:head>
	<title>Members - {club.name} - Clubs Event Portal</title>
</svelte:head>

<SiteNav user={data.user} />

<div class="container">
	<ClubHeader clubName={club.name} section="Members">
		<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
		{#if club.role === 'leader'}
			<button type="button" class="add-btn" onclick={openAddModal}>
				+ Add Member
			</button>
			<button type="button" class="announce-btn" onclick={openAnnouncementModal}>
				Send Announcement
			</button>
		{/if}
	</ClubHeader>

	{#if club.joinCode}
		<div class="invite-banner">
			<span class="invite-label">Invite new members:</span>
			<a href="https://hack.club/join/{club.joinCode}" target="_blank" rel="noopener noreferrer" class="invite-link">
				hack.club/join/{club.joinCode}
			</a>
		</div>
	{/if}

	{#if form?.addSuccess}
		<div class="success-banner">Member added successfully!</div>
	{/if}

	{#if form?.editSuccess}
		<div class="success-banner">Member updated successfully!</div>
	{/if}

	<section class="members-section">
		{#if (club.members && club.members.length > 0) || (leaders && leaders.length > 0)}
			<div class="members-grid">
				{#each leaders as leader}
					<div class="member-card leadership-card">
						<div class="member-avatar leadership-avatar">{leader.name.charAt(0).toUpperCase()}</div>
						<div class="member-info">
							<span class="member-name">
								{leader.name}
								<span class="badge badge-leader">
									Leader
								</span>
							</span>
						</div>
					</div>
				{/each}
				{#each coleaders as coleader}
					<div class="member-card leadership-card">
						<div class="member-avatar leadership-avatar">{coleader.name.charAt(0).toUpperCase()}</div>
						<div class="member-info">
							<span class="member-name">
								{coleader.name}
								<span class="badge badge-coleader">
									Co-Leader
								</span>
							</span>
						</div>
					</div>
				{/each}
				{#if club.members}
					{#each club.members as member}
						{#if !leaders.some(l => l.name.toLowerCase() === member.toLowerCase())}
							<div class="member-card">
								{#if club.role === 'leader'}
									<button type="button" class="member-clickable" title="View ships" onclick={() => openDetailsModal(member)}>
										<div class="member-avatar">{member.charAt(0).toUpperCase()}</div>
										<div class="member-info">
											<span class="member-name">{member}</span>
											<span class="member-subtext">View ships →</span>
										</div>
									</button>
									<button type="button" class="edit-btn" title="Edit member" onclick={() => openEditModal(member)}>✎</button>
									<form method="POST" action="?/removeMember" class="remove-form" onsubmit={(e) => confirmRemove(e, member)}>
										<input type="hidden" name="memberName" value={member} />
										<button type="submit" class="remove-btn" title="Remove member">×</button>
									</form>
								{:else}
									<div class="member-avatar">{member.charAt(0).toUpperCase()}</div>
									<div class="member-info">
										<span class="member-name">{member}</span>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		{:else}
			<div class="empty-state">
				<p>No members yet. Share your invite link to get started!</p>
			</div>
		{/if}
	</section>
</div>

{#if showAnnouncementModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeAnnouncementModal} onkeydown={(e) => e.key === 'Escape' && closeAnnouncementModal()}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Send Announcement to {club.name}</h3>
				<button type="button" class="modal-close" onclick={closeAnnouncementModal}>×</button>
			</div>
			<form method="POST" action="?/sendAnnouncement" onsubmit={() => isSending = true}>
				<div class="modal-body">
					{#if form?.error}
						<div class="error-message">{form.error}</div>
					{/if}
					{#if form?.success}
						<div class="success-message">Announcement sent to {form.membersUpdated} members!</div>
					{/if}
					<label for="message">Message</label>
					<textarea
						id="message"
						name="message"
						bind:value={announcementMessage}
						placeholder="Write your announcement here..."
						rows="5"
						maxlength="1000"
						required
					></textarea>
					<div class="char-count">{announcementMessage.length}/1000</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="cancel-btn" onclick={closeAnnouncementModal}>Cancel</button>
					<button type="submit" class="send-btn" disabled={isSending || !announcementMessage.trim()}>
						{isSending ? 'Sending...' : 'Send Announcement'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showEditModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeEditModal} onkeydown={(e) => e.key === 'Escape' && closeEditModal()}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Edit Member</h3>
				<button type="button" class="modal-close" onclick={closeEditModal}>×</button>
			</div>
			<form method="POST" action="?/editMember" onsubmit={() => isEditing = true}>
				<input type="hidden" name="memberName" value={editingMember} />
				<div class="modal-body">
					{#if isLoadingMember}
						<div class="loading-text">Loading member info...</div>
					{/if}
					<label for="editName">Name</label>
					<input
						type="text"
						id="editName"
						name="newName"
						bind:value={editName}
						placeholder="Member name"
						required
					/>
					<label for="editEmail">Email</label>
					<input
						type="email"
						id="editEmail"
						name="newEmail"
						bind:value={editEmail}
						placeholder="Member email"
					/>
				</div>
				<div class="modal-footer">
					<button type="button" class="cancel-btn" onclick={closeEditModal}>Cancel</button>
					<button type="submit" class="send-btn" disabled={isEditing || isLoadingMember}>
						{isEditing ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showAddModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeAddModal} onkeydown={(e) => e.key === 'Escape' && closeAddModal()}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Add New Member</h3>
				<button type="button" class="modal-close" onclick={closeAddModal}>×</button>
			</div>
			<form method="POST" action="?/addMember" onsubmit={() => isAdding = true}>
				<div class="modal-body">
					{#if form?.error && showAddModal}
						<div class="error-message">{form.error}</div>
					{/if}
					<label for="newName">Name</label>
					<input
						type="text"
						id="newName"
						name="name"
						bind:value={newMemberName}
						placeholder="Member name"
						required
					/>
					<label for="newEmail">Email</label>
					<input
						type="email"
						id="newEmail"
						name="email"
						bind:value={newMemberEmail}
						placeholder="Member email"
						required
					/>
				</div>
				<div class="modal-footer">
					<button type="button" class="cancel-btn" onclick={closeAddModal}>Cancel</button>
					<button type="submit" class="send-btn" disabled={isAdding || !newMemberName.trim() || !newMemberEmail.trim()}>
						{isAdding ? 'Adding...' : 'Add Member'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showDetailsModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeDetailsModal} onkeydown={(e) => e.key === 'Escape' && closeDetailsModal()}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{detailsMemberName}</h3>
				<button type="button" class="modal-close" onclick={closeDetailsModal}>×</button>
			</div>
			<div class="modal-body">
				<div class="detail-row">
					<span class="detail-label">Email</span>
					<span class="detail-value">{detailsMemberEmail || 'Not available'}</span>
				</div>

				<div class="detail-row detail-row-ships">
					<span class="detail-label">Ships ({detailsShips.length})</span>
					{#if detailsTotalHours > 0}
						<span class="detail-total-hours">{detailsTotalHours} {detailsTotalHours === 1 ? 'hour' : 'hours'} total</span>
					{/if}
				</div>

				{#if isLoadingDetails}
					<div class="loading-text">Loading ships...</div>
				{:else if detailsShips.length > 0}
					<div class="ships-list">
						{#each detailsShips as ship}
							<div class="ship-item">
								<span class="ship-detail">
									<span class="ship-name">{ship.ysws}</span>
									{#if ship.hoursSpent != null}
										<span class="ship-hours">{ship.hoursSpent} {ship.hoursSpent === 1 ? 'hour' : 'hours'} spent</span>
									{/if}
								</span>
								{#if ship.codeUrl}
									<a href={ship.codeUrl} target="_blank" rel="noopener noreferrer" class="ship-link">View Code →</a>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-ships">No ships yet.</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button type="button" class="cancel-btn" onclick={closeDetailsModal}>Close</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px 48px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.add-btn {
		padding: 10px 20px;
		background-color: #33d6a6;
		color: white;
		border: 2px solid #33d6a6;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
	}

	.add-btn:hover {
		background-color: #2bc495;
		border-color: #2bc495;
	}

	.announce-btn {
		padding: 10px 20px;
		background-color: #338eda;
		color: white;
		border: 2px solid #338eda;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
	}

	.announce-btn:hover {
		background-color: #2a7bc8;
		border-color: #2a7bc8;
	}

	.invite-banner {
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
	}

	.invite-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-muted);
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

	.success-banner {
		background: light-dark(#e6fff2, rgba(51, 214, 166, 0.16));
		color: var(--color-text);
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #33d6a6;
		font-weight: 500;
	}

	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.member-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: var(--bg-card);
		border: 2px solid var(--color-border);
		border-radius: 8px;
	}

	.member-card:hover {
		border-color: #ec3750;
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

	.member-clickable {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: 'Phantom Sans', sans-serif;
	}

	.member-subtext {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #338eda;
		margin-top: 2px;
	}

	.member-info {
		flex: 1;
		min-width: 0;
	}

	.member-name {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.edit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-muted);
		font-size: 14px;
		cursor: pointer;
		line-height: 1;
	}

	.edit-btn:hover {
		background: #338eda;
		border-color: #338eda;
		color: white;
	}

	.remove-form {
		display: contents;
	}

	.remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-muted);
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		line-height: 1;
	}

	.remove-btn:hover {
		background: #ec3750;
		border-color: #ec3750;
		color: white;
	}

	.empty-state {
		background: var(--bg-sunken);
		padding: 48px;
		border-radius: 12px;
		border: 2px dashed var(--color-border);
		text-align: center;
	}

	.empty-state p {
		color: var(--color-muted);
		font-size: 18px;
		margin: 0;
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
		background: var(--bg-card);
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		border: 2px solid var(--color-border);
	}

	.modal-body {
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		color: var(--color-text);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 24px;
		color: var(--color-muted);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.modal-close:hover {
		color: var(--color-text);
	}

	.modal-body {
		padding: 24px;
	}

	.modal-body label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 8px;
	}

	.modal-body textarea,
	.modal-body input[type="text"],
	.modal-body input[type="email"] {
		width: 100%;
		padding: 12px;
		border: 2px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', sans-serif;
		box-sizing: border-box;
		margin-bottom: 16px;
	}

	.modal-body textarea {
		resize: vertical;
	}

	.modal-body textarea:focus,
	.modal-body input:focus {
		outline: none;
		border-color: #338eda;
	}

	.char-count {
		text-align: right;
		font-size: 12px;
		color: var(--color-muted);
		margin-top: -12px;
	}

	.loading-text {
		color: var(--color-muted);
		font-size: 14px;
		margin-bottom: 16px;
	}

	.detail-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 16px;
	}

	.detail-row-ships {
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
	}

	.detail-total-hours {
		font-size: 14px;
		font-weight: 600;
		color: #33d6a6;
		white-space: nowrap;
	}

	.detail-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.detail-value {
		font-size: 15px;
		color: var(--color-text);
		word-break: break-all;
	}

	.ships-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ship-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		background: var(--bg-sunken);
		border: 2px solid var(--color-border);
		border-radius: 8px;
	}

	.ship-detail {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.ship-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ship-hours {
		font-size: 13px;
		color: var(--color-muted);
	}

	.ship-link {
		font-size: 13px;
		color: #ec3750;
		text-decoration: none;
		font-weight: 600;
		white-space: nowrap;
	}

	.ship-link:hover {
		text-decoration: underline;
	}

	.empty-ships {
		color: var(--color-muted);
		font-size: 14px;
		padding: 12px 0;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid var(--color-border);
	}

	.cancel-btn {
		padding: 10px 20px;
		background: var(--bg-sunken);
		color: var(--color-text);
		border: 2px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
	}

	.cancel-btn:hover {
		background: var(--color-border);
	}

	.send-btn {
		padding: 10px 20px;
		background: #338eda;
		color: white;
		border: 2px solid #338eda;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', sans-serif;
	}

	.send-btn:hover:not(:disabled) {
		background: #2a7bc8;
		border-color: #2a7bc8;
	}

	.send-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		background: light-dark(#fff5f7, rgba(236, 55, 80, 0.16));
		color: #ec3750;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #ec3750;
	}

	.success-message {
		background: light-dark(#e6fff2, rgba(51, 214, 166, 0.16));
		color: #33d6a6;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #33d6a6;
	}

	.leadership-card {
		border-color: #ec3750;
		background: light-dark(#fff5f6, rgba(236, 55, 80, 0.16));
	}

	.leadership-avatar {
		background: #ec3750;
	}

	.badge {
		display: inline-block;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 8px;
		vertical-align: middle;
	}

	.badge-leader {
		background-color: light-dark(#fff5f6, rgba(236, 55, 80, 0.16));
		color: #ec3750;
		border: 1px solid #ec3750;
	}

	.badge-coleader {
		background-color: light-dark(#e6f4ff, rgba(51, 142, 218, 0.18));
		color: #338eda;
		border: 1px solid #338eda;
	}
</style>
