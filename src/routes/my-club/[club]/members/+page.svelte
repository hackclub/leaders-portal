<script>
	let { data, form } = $props();

	let showAnnouncementModal = $state(false);
	let announcementMessage = $state('');
	let isSending = $state(false);

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
</script>

<svelte:head>
	<title>Members - {data.club.name} - Clubs Event Portal</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{data.club.name}</h1>
			<p class="page-subtitle">Members</p>
		</div>
		<div class="header-buttons">
			{#if data.club.role === 'leader'}
				<button type="button" class="announce-btn" onclick={openAnnouncementModal}>
					Send Announcement
				</button>
			{/if}
		</div>
	</header>

	{#if data.club.joinCode}
		<div class="invite-banner">
			<span class="invite-label">Invite new members:</span>
			<a href="https://hack.club/join/{data.club.joinCode}" target="_blank" rel="noopener noreferrer" class="invite-link">
				hack.club/join/{data.club.joinCode}
			</a>
		</div>
	{/if}

	<section class="members-section">
		{#if data.club.members && data.club.members.length > 0}
			<div class="members-grid">
				{#each data.club.members as member}
					<div class="member-card">
						<div class="member-avatar">{member.charAt(0).toUpperCase()}</div>
						<div class="member-info">
							<span class="member-name">{member}</span>
						</div>
						{#if data.club.role === 'leader'}
							<form method="POST" action="?/removeMember" class="remove-form" onsubmit={(e) => confirmRemove(e, member)}>
								<input type="hidden" name="memberName" value={member} />
								<button type="submit" class="remove-btn" title="Remove member">×</button>
							</form>
						{/if}
					</div>
				{/each}
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
				<h3>Send Announcement to {data.club.name}</h3>
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
		align-items: flex-start;
		margin-bottom: 24px;
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
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 36px;
		font-weight: bold;
		color: #1f2d3d;
		margin: 0;
	}

	.page-subtitle {
		font-size: 18px;
		color: #ec3750;
		font-weight: 600;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 12px;
		align-items: center;
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
		background: #f9fafc;
		border: 2px solid #e0e6ed;
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
		background: white;
		border: 2px solid #e0e6ed;
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

	.member-info {
		flex: 1;
		min-width: 0;
	}

	.member-name {
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		color: #8492a6;
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
		max-width: 500px;
		border: 2px solid #e0e6ed;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e0e6ed;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		color: #1f2d3d;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 24px;
		color: #8492a6;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.modal-close:hover {
		color: #1f2d3d;
	}

	.modal-body {
		padding: 24px;
	}

	.modal-body label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 8px;
	}

	.modal-body textarea {
		width: 100%;
		padding: 12px;
		border: 2px solid #e0e6ed;
		border-radius: 6px;
		font-size: 14px;
		font-family: 'Phantom Sans', sans-serif;
		resize: vertical;
		box-sizing: border-box;
	}

	.modal-body textarea:focus {
		outline: none;
		border-color: #338eda;
	}

	.char-count {
		text-align: right;
		font-size: 12px;
		color: #8492a6;
		margin-top: 4px;
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
		font-family: 'Phantom Sans', sans-serif;
	}

	.cancel-btn:hover {
		background: #e0e6ed;
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
		background: #fff5f7;
		color: #ec3750;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
		border: 2px solid #ec3750;
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
</style>
