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
				<button class="modal-close" onclick={onClose}>&times;</button>
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
		max-width: 400px;
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e0e6ed;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		color: #1f2d3d;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 28px;
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
</style>
