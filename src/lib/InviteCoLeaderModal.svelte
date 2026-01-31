<script>
	import Modal from './Modal.svelte';
	import { toasts } from './stores/toast.js';
	
	let { open = $bindable(false), clubId = '', clubName = '', onClose = null } = $props();
	
	let email = $state('');
	let message = $state('');
	let isSubmitting = $state(false);
	let inviteSent = $state(false);
	
	function resetForm() {
		email = '';
		message = '';
		isSubmitting = false;
		inviteSent = false;
	}
	
	function handleClose() {
		resetForm();
		open = false;
		if (onClose) onClose();
	}
	
	async function handleSubmit(e) {
		e.preventDefault();
		if (!email || isSubmitting) return;
		
		isSubmitting = true;
		
		try {
			const response = await fetch('/api/club/invite-coleader', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					clubId,
					email: email.trim(),
					message: message.trim()
				})
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to send invitation');
			}
			
			inviteSent = true;
			toasts.success(`Invitation sent to ${email}`);
		} catch (err) {
			toasts.error(err.message);
		} finally {
			isSubmitting = false;
		}
	}
	
	function sendAnother() {
		resetForm();
	}
</script>

<Modal {open} title="Invite Co-Leader" onClose={handleClose}>
	{#if inviteSent}
		<div class="success-state">
			<div class="success-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<path d="M9 12l2 2 4-4"/>
				</svg>
			</div>
			<h3>Invitation Sent!</h3>
			<p>We've sent an email to <strong>{email}</strong> with instructions to join <strong>{clubName}</strong> as a co-leader.</p>
			<div class="success-actions">
				<button type="button" class="btn-secondary" onclick={sendAnother}>
					Invite Another
				</button>
				<button type="button" class="btn-primary" onclick={handleClose}>
					Done
				</button>
			</div>
		</div>
	{:else}
		<form onsubmit={handleSubmit}>
			<p class="intro-text">
				Invite someone to help you lead <strong>{clubName}</strong>. They'll receive an email with instructions to join.
			</p>
			
			<div class="form-group">
				<label for="coleader-email">Email Address</label>
				<input 
					type="email" 
					id="coleader-email"
					bind:value={email}
					placeholder="coleader@example.com"
					required
					disabled={isSubmitting}
					autocomplete="email"
				/>
			</div>
			
			<div class="form-group">
				<label for="invite-message">Personal Message <span class="optional">(optional)</span></label>
				<textarea 
					id="invite-message"
					bind:value={message}
					placeholder="Hey! I'd love for you to help lead our Hack Club..."
					rows="3"
					disabled={isSubmitting}
				></textarea>
			</div>
			
			<div class="form-actions">
				<button type="button" class="btn-secondary" onclick={handleClose} disabled={isSubmitting}>
					Cancel
				</button>
				<button type="submit" class="btn-primary" disabled={!email || isSubmitting}>
					{#if isSubmitting}
						<span class="spinner"></span>
						Sending...
					{:else}
						Send Invitation
					{/if}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<style>
	.intro-text {
		color: #8492a6;
		font-size: 14px;
		margin: 0 0 20px 0;
		line-height: 1.5;
	}
	
	.intro-text strong {
		color: #1f2d3d;
	}
	
	.form-group {
		margin-bottom: 16px;
	}
	
	.form-group label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 6px;
	}
	
	.optional {
		font-weight: 400;
		color: #8492a6;
	}
	
	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 12px 14px;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 14px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		box-sizing: border-box;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	
	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #338eda;
		box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
	}
	
	.form-group input:disabled,
	.form-group textarea:disabled {
		background: #f9fafc;
		cursor: not-allowed;
	}
	
	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}
	
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid #e0e6ed;
	}
	
	.btn-primary,
	.btn-secondary {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	
	.btn-primary {
		background: #ec3750;
		color: white;
		border: none;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #d32f44;
		transform: translateY(-1px);
	}
	
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	.btn-secondary {
		background: white;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background: #f9fafc;
		border-color: #8492a6;
	}
	
	.btn-secondary:disabled {
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
	
	/* Success state */
	.success-state {
		text-align: center;
		padding: 20px 0;
	}
	
	.success-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 16px;
		color: #33d6a6;
	}
	
	.success-icon svg {
		width: 100%;
		height: 100%;
	}
	
	.success-state h3 {
		margin: 0 0 12px 0;
		font-size: 20px;
		color: #1f2d3d;
	}
	
	.success-state p {
		color: #8492a6;
		font-size: 14px;
		line-height: 1.5;
		margin: 0 0 24px 0;
	}
	
	.success-state strong {
		color: #1f2d3d;
	}
	
	.success-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
	}
</style>
