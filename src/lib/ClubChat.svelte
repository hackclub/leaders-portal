<script>
	import { enhance } from '$app/forms';

	let {
		clubName,
		messages = [],
		canDelete = false,
		currentEmail = '',
		expanded = $bindable(false)
	} = $props();

	let message = $state('');
	let isSending = $state(false);

	function formatDate(value) {
		const date = new Date(value);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function handleSend() {
		isSending = true;
		return async ({ update }) => {
			await update();
			message = '';
			isSending = false;
		};
	}

	function handleDelete() {
		return async ({ update }) => {
			await update();
		};
	}
</script>

<div class="chat">
	{#if expanded}
	<div class="chat-messages">
		{#if messages.length > 0}
			{#each messages as msg (msg.id)}
				<div class="chat-message">
					<div class="chat-meta">
						<span class="chat-author">
							{#if msg.is_leader}<span class="leader-badge">Leader</span>{/if}
							{msg.sender_name}
						</span>
						<span class="chat-time">{formatDate(msg.created_at)}</span>
						{#if canDelete}
							<form
								method="POST"
								action="?/deleteChatMessage"
								use:enhance={handleDelete}
								class="delete-form"
							>
								<input type="hidden" name="clubName" value={clubName} />
								<input type="hidden" name="messageId" value={msg.id} />
								<button type="submit" class="delete-btn" title="Delete message" aria-label="Delete message">×</button>
							</form>
						{/if}
					</div>
					<p class="chat-text">{msg.message}</p>
				</div>
			{/each}
		{:else}
			<div class="chat-empty">
				<span class="chat-empty-icon">💬</span>
				<p class="chat-empty-text">No messages yet. Say hello to your club!</p>
			</div>
		{/if}
	</div>

	<form method="POST" action="?/sendChatMessage" use:enhance={handleSend} class="chat-form">
		<input type="hidden" name="clubName" value={clubName} />
		<input
			type="text"
			name="message"
			bind:value={message}
			placeholder="Type a message..."
			maxlength="1000"
			autocomplete="off"
			class="chat-input"
		/>
		<button type="submit" class="chat-send" disabled={isSending || !message.trim()}>
			{isSending ? 'Sending...' : 'Send'}
		</button>
	</form>
	{/if}
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.chat-messages {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 380px;
		overflow-y: auto;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.chat-message {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 5px 12px;
	}

	.chat-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}

	.chat-author {
		font-weight: 600;
		color: var(--color-text);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.leader-badge {
		background: #ec3750;
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 2px 6px;
		border-radius: 6px;
	}

	.chat-time {
		color: var(--color-muted);
		font-size: 12px;
	}

	.delete-form {
		margin: 0 0 0 auto;
	}

	.delete-btn {
		background: none;
		border: none;
		color: var(--color-muted);
		font-size: 18px;
		line-height: 1;
		cursor: pointer;
		padding: 0 4px;
		border-radius: 4px;
	}

	.delete-btn:hover {
		color: #ec3750;
	}

	.chat-text {
		margin: 0;
		font-size: 15px;
		color: var(--color-text);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.chat-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px;
		text-align: center;
	}

	.chat-empty-icon {
		font-size: 28px;
	}

	.chat-empty-text {
		font-size: 15px;
		color: var(--color-muted);
		margin: 0;
	}

	.chat-form {
		display: flex;
		gap: 8px;
	}

	.chat-input {
		flex: 1;
		padding: 10px 12px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 15px;
		background: var(--bg-card);
		color: var(--color-text);
		font-family: inherit;
	}

	.chat-input:focus {
		outline: none;
		border-color: #ec3750;
	}

	.chat-send {
		padding: 10px 18px;
		background: #ec3750;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}

	.chat-send:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
