<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import ConfirmModal from '$lib/ConfirmModal.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { toasts } from '$lib/stores/toast.js';
	
	let { data, form } = $props();
	let club = $state(data.club);
	let announcements = $state(data.announcements || []);

	function handleRefresh(refreshedClub) {
		club = mergeClubData(club, refreshedClub);
	}

	// New/Edit Modal state
	let showModal = $state(false);
	let editingAnnouncement = $state(null);
	let title = $state('');
	let message = $state('');
	let isSending = $state(false);

	// Delete confirm state
	let showDeleteConfirm = $state(false);
	let deleteId = $state(null);
	let deleteFormRef = $state(null);

	function openNewModal() {
		editingAnnouncement = null;
		title = '';
		message = '';
		showModal = true;
	}

	function openEditModal(announcement) {
		editingAnnouncement = announcement;
		title = announcement.subject || '';
		message = announcement.message || '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingAnnouncement = null;
		title = '';
		message = '';
		isSending = false;
	}

	function openDeleteConfirm(id, formElement) {
		deleteId = id;
		deleteFormRef = formElement;
		showDeleteConfirm = true;
	}

	function closeDeleteConfirm() {
		showDeleteConfirm = false;
		deleteId = null;
		deleteFormRef = null;
	}

	function handleDeleteConfirm() {
		if (deleteFormRef) {
			deleteFormRef.submit();
		}
		closeDeleteConfirm();
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		if (form?.announcementSuccess) {
			toasts.success(`Announcement sent to ${form.recipientCount || 'all'} members!`);
			closeModal();
			window.location.reload();
		}
		if (form?.updateSuccess) {
			toasts.success('Announcement updated successfully!');
			closeModal();
			window.location.reload();
		}
		if (form?.deleteSuccess) {
			toasts.success('Announcement deleted');
			window.location.reload();
		}
		if (form?.error) {
			toasts.error(form.error);
			isSending = false;
		}
	});
</script>

<svelte:head>
	<title>Announcements - {club.name} - Hack Club</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{club.name}</h1>
			<p class="page-subtitle">Announcements</p>
		</div>
		<div class="header-buttons">
			<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
			{#if club.role === 'leader'}
				<button type="button" class="primary-btn" onclick={openNewModal}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m3 11 18-5v12L3 13v-2z"/>
						<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
					</svg>
					New Announcement
				</button>
			{/if}
		</div>
	</header>

	<div class="content">
		{#if club.role !== 'leader'}
			<div class="info-banner">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="16" x2="12" y2="12"/>
					<line x1="12" y1="8" x2="12.01" y2="8"/>
				</svg>
				<span>Only club leaders can send announcements.</span>
			</div>
		{/if}

		{#if announcements.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="m3 11 18-5v12L3 13v-2z"/>
						<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
					</svg>
				</div>
				<h3>No announcements yet</h3>
				<p>Send your first announcement to keep club members informed about meetings, events, and updates.</p>
				{#if club.role === 'leader'}
					<button type="button" class="primary-btn" onclick={openNewModal}>
						Send First Announcement
					</button>
				{/if}
			</div>
		{:else}
			<div class="announcements-list">
				{#each announcements as announcement}
					<div class="announcement-card">
						<div class="announcement-header">
							<h3>{announcement.subject || 'Club Announcement'}</h3>
							<span class="announcement-date">{formatDate(announcement.created_at)}</span>
						</div>
						<div class="announcement-body">
							<p>{announcement.message}</p>
						</div>
						<div class="announcement-footer">
							<span class="sent-info">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
									<circle cx="9" cy="7" r="4"/>
								</svg>
								Sent to {announcement.member_count || 0} members
							</span>
							{#if club.role === 'leader'}
								<div class="action-buttons">
									<button type="button" class="edit-btn" onclick={() => openEditModal(announcement)}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
										</svg>
										Edit
									</button>
									<form method="POST" action="?/deleteAnnouncement" class="delete-form" bind:this={deleteFormRef}>
										<input type="hidden" name="id" value={announcement.id} />
										<button type="button" class="delete-btn" onclick={(e) => { e.preventDefault(); openDeleteConfirm(announcement.id, e.target.closest('form')); }}>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<polyline points="3 6 5 6 21 6"/>
												<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
											</svg>
											Delete
										</button>
									</form>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- New/Edit Announcement Modal -->
<Modal open={showModal} title={editingAnnouncement ? "Edit Announcement" : "Send Announcement"} onClose={closeModal}>
	{#if !editingAnnouncement}
		<p class="modal-subtitle">This will be sent to all {club.members?.length || 0} club members via email.</p>
	{/if}
	
	<form method="POST" action={editingAnnouncement ? "?/updateAnnouncement" : "?/sendAnnouncement"} onsubmit={() => isSending = true}>
		{#if editingAnnouncement}
			<input type="hidden" name="id" value={editingAnnouncement.id} />
		{/if}
		<div class="form-group">
			<label for="title">Subject</label>
			<input 
				type="text" 
				id="title" 
				name="title" 
				bind:value={title}
				placeholder="e.g., Meeting Tomorrow!"
			/>
		</div>
		
		<div class="form-group">
			<label for="message">Message <span class="required">*</span></label>
			<textarea 
				id="message" 
				name="message" 
				bind:value={message}
				placeholder="Write your announcement here..."
				rows="6"
				required
			></textarea>
		</div>

		<div class="modal-actions">
			<button type="button" class="cancel-btn" onclick={closeModal}>Cancel</button>
			<button type="submit" class="send-btn" disabled={isSending || !message.trim()}>
				{#if isSending}
					<span class="spinner"></span>
					{editingAnnouncement ? 'Saving...' : 'Sending...'}
				{:else if editingAnnouncement}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
						<polyline points="17 21 17 13 7 13 7 21"/>
						<polyline points="7 3 7 8 15 8"/>
					</svg>
					Save Changes
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="22" y1="2" x2="11" y2="13"/>
						<polygon points="22,2 15,22 11,13 2,9"/>
					</svg>
					Send Announcement
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Delete Confirmation Modal -->
<ConfirmModal 
	open={showDeleteConfirm}
	title="Delete Announcement"
	message="Are you sure you want to delete this announcement? This action cannot be undone."
	confirmText="Delete"
	variant="danger"
	onConfirm={handleDeleteConfirm}
	onCancel={closeDeleteConfirm}
/>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.back-link {
		color: #8492a6;
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0;
	}

	.page-subtitle {
		font-size: 1rem;
		color: #8492a6;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.primary-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.primary-btn:hover {
		background: #d63045;
		transform: translateY(-1px);
	}

	.info-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: #f0f7ff;
		border: 1px solid #338eda;
		border-radius: 10px;
		color: #338eda;
		margin-bottom: 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: #f9fafc;
		border-radius: 16px;
		border: 2px dashed #e0e6ed;
	}

	.empty-icon {
		color: #8492a6;
		margin-bottom: 1rem;
		display: flex;
		justify-content: center;
	}

	.empty-state h3 {
		font-size: 1.25rem;
		color: #1f2d3d;
		margin: 0 0 0.5rem;
	}

	.empty-state p {
		color: #8492a6;
		margin: 0 0 1.5rem;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.empty-state .primary-btn {
		margin: 0 auto;
	}

	.announcements-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.announcement-card {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.announcement-card:hover {
		border-color: #d0d6de;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.announcement-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.announcement-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0;
	}

	.announcement-date {
		font-size: 0.8rem;
		color: #8492a6;
		white-space: nowrap;
	}

	.announcement-body {
		margin-bottom: 1rem;
	}

	.announcement-body p {
		color: #3c4858;
		margin: 0;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.announcement-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.75rem;
		border-top: 1px solid #f0f2f5;
	}

	.sent-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #8492a6;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.delete-form {
		margin: 0;
	}

	.edit-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		background: transparent;
		border: 1px solid #e0e6ed;
		border-radius: 6px;
		color: #8492a6;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-btn:hover {
		background: #f0f7ff;
		border-color: #338eda;
		color: #338eda;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		background: transparent;
		border: 1px solid #e0e6ed;
		border-radius: 6px;
		color: #8492a6;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.delete-btn:hover {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}

	/* Modal Styles */
	.modal-content {
		padding: 0.5rem;
	}

	.modal-content h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 0.25rem;
	}

	.modal-subtitle {
		color: #8492a6;
		margin: 0 0 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group label {
		display: block;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.required {
		color: #ec3750;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #e0e6ed;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #ec3750;
		box-shadow: 0 0 0 3px rgba(236, 55, 80, 0.1);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 120px;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.cancel-btn {
		padding: 0.75rem 1.25rem;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 8px;
		color: #3c4858;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn:hover {
		background: #f0f2f5;
	}

	.send-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.send-btn:hover:not(:disabled) {
		background: #d63045;
	}

	.send-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

	/* Dark mode */
	:global(.dark) .container {
		background: transparent;
	}

	:global(.dark) .page-title {
		color: #f9fafc;
	}

	:global(.dark) .back-link {
		color: #8492a6;
	}

	:global(.dark) .back-link:hover {
		color: #ec3750;
	}

	:global(.dark) .empty-state {
		background: #1a1a2e;
		border-color: #2d2d44;
	}

	:global(.dark) .empty-state h3 {
		color: #f9fafc;
	}

	:global(.dark) .announcement-card {
		background: #1a1a2e;
		border-color: #2d2d44;
	}

	:global(.dark) .announcement-card:hover {
		border-color: #3d3d54;
	}

	:global(.dark) .announcement-header h3 {
		color: #f9fafc;
	}

	:global(.dark) .announcement-body p {
		color: #c0ccda;
	}

	:global(.dark) .announcement-footer {
		border-color: #2d2d44;
	}

	:global(.dark) .info-banner {
		background: rgba(51, 142, 218, 0.1);
		border-color: #338eda;
	}

	:global(.dark) .modal-content h2 {
		color: #f9fafc;
	}

	:global(.dark) .form-group label {
		color: #f9fafc;
	}

	:global(.dark) .form-group input,
	:global(.dark) .form-group textarea {
		background: #1a1a2e;
		border-color: #2d2d44;
		color: #f9fafc;
	}

	:global(.dark) .cancel-btn {
		background: #2d2d44;
		border-color: #3d3d54;
		color: #f9fafc;
	}

	:global(.dark) .delete-btn {
		border-color: #2d2d44;
	}

	:global(.dark) .delete-btn:hover {
		background: rgba(220, 38, 38, 0.1);
		border-color: rgba(220, 38, 38, 0.5);
	}

	@media (max-width: 640px) {
		.container {
			padding: 1rem;
		}

		header {
			flex-direction: column;
		}

		.header-buttons {
			width: 100%;
			flex-wrap: wrap;
		}

		.primary-btn {
			flex: 1;
			justify-content: center;
		}

		.announcement-header {
			flex-direction: column;
			gap: 0.25rem;
		}

		.announcement-footer {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}
	}
</style>
