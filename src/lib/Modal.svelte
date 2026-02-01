<script>
	let { open = false, title = '', onClose, children } = $props();

	function handleOverlayClick() {
		onClose?.();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			onClose?.();
		}
	}
</script>

{#if open}
	<div class="modal-overlay" role="button" tabindex="-1" onclick={handleOverlayClick} onkeydown={handleKeydown}>
		<div class="modal" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{title}</h2>
				<button class="modal-close" onclick={onClose} aria-label="Close modal">&times;</button>
			</div>
			<div class="modal-body">
				{@render children()}
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
		max-width: 440px;
		max-height: 85vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
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

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e0e6ed;
		flex-shrink: 0;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2d3d;
	}

	.modal-close {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f9fafc;
		border: none;
		border-radius: 10px;
		font-size: 1.5rem;
		line-height: 1;
		color: #8492a6;
		cursor: pointer;
		transition: all 0.2s;
	}

	.modal-close:hover {
		background: #ec3750;
		color: white;
		transform: scale(1.05);
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
	}

	@media (max-width: 480px) {
		.modal-overlay {
			padding: 16px;
		}

		.modal {
			border-radius: 16px;
		}

		.modal-header {
			padding: 16px 20px;
		}

		.modal-body {
			padding: 20px;
		}
	}
</style>
