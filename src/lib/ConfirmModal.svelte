<script>
	let { 
		open = false, 
		title = 'Confirm Action', 
		message = 'Are you sure?', 
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'danger', // 'danger', 'warning', 'primary'
		onConfirm,
		onCancel 
	} = $props();

	function handleConfirm() {
		onConfirm?.();
	}

	function handleCancel() {
		onCancel?.();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

{#if open}
	<div class="modal-overlay" role="button" tabindex="-1" onclick={handleCancel} onkeydown={handleKeydown}>
		<div class="modal" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-icon {variant}">
				{#if variant === 'danger'}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<line x1="15" y1="9" x2="9" y2="15"/>
						<line x1="9" y1="9" x2="15" y2="15"/>
					</svg>
				{:else if variant === 'warning'}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
						<line x1="12" y1="9" x2="12" y2="13"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				{:else}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="16" x2="12" y2="12"/>
						<line x1="12" y1="8" x2="12.01" y2="8"/>
					</svg>
				{/if}
			</div>
			<h2 class="modal-title">{title}</h2>
			<p class="modal-message">{message}</p>
			<div class="modal-actions">
				<button type="button" class="cancel-btn" onclick={handleCancel}>{cancelText}</button>
				<button type="button" class="confirm-btn {variant}" onclick={handleConfirm}>{confirmText}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(31, 45, 61, 0.5);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		background: white;
		border-radius: 20px;
		width: 100%;
		max-width: 400px;
		padding: 32px;
		text-align: center;
		box-shadow: 0 24px 60px rgba(31, 45, 61, 0.25);
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(24px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.modal-icon.danger {
		background: #fef2f2;
		color: #dc2626;
	}

	.modal-icon.warning {
		background: #fffbeb;
		color: #f59e0b;
	}

	.modal-icon.primary {
		background: #f0f7ff;
		color: #338eda;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 8px;
	}

	.modal-message {
		color: #8492a6;
		margin: 0 0 24px;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
	}

	.cancel-btn, .confirm-btn {
		flex: 1;
		padding: 12px 20px;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn {
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		color: #3c4858;
	}

	.cancel-btn:hover {
		background: #f0f2f5;
	}

	.confirm-btn {
		border: none;
		color: white;
	}

	.confirm-btn.danger {
		background: #dc2626;
	}

	.confirm-btn.danger:hover {
		background: #b91c1c;
	}

	.confirm-btn.warning {
		background: #f59e0b;
	}

	.confirm-btn.warning:hover {
		background: #d97706;
	}

	.confirm-btn.primary {
		background: #ec3750;
	}

	.confirm-btn.primary:hover {
		background: #d63045;
	}

	/* Dark mode */
	:global(.dark) .modal {
		background: #1a1a2e;
	}

	:global(.dark) .modal-title {
		color: #f9fafc;
	}

	:global(.dark) .modal-message {
		color: #a0aec0;
	}

	:global(.dark) .cancel-btn {
		background: #2d2d44;
		border-color: #3d3d54;
		color: #f9fafc;
	}

	:global(.dark) .cancel-btn:hover {
		background: #3d3d54;
	}

	:global(.dark) .modal-icon.danger {
		background: rgba(220, 38, 38, 0.15);
	}

	:global(.dark) .modal-icon.warning {
		background: rgba(245, 158, 11, 0.15);
	}

	:global(.dark) .modal-icon.primary {
		background: rgba(51, 142, 218, 0.15);
	}

	@media (max-width: 480px) {
		.modal {
			padding: 24px;
		}

		.modal-actions {
			flex-direction: column-reverse;
		}
	}
</style>
