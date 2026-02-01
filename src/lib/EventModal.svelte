<script>
	export let event;
	export let closeModal;
</script>

<div class="modal-overlay" onclick={closeModal} onkeydown={(e) => e.key === 'Escape' && closeModal()} role="button" tabindex="0">
	<div class="modal-content" style="background-color: {event.color};" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" tabindex="0">
		<button class="close-button" onclick={closeModal} aria-label="Close modal">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
		
		<div class="modal-header">
			<div class="modal-icon" style="background-color: rgba(255,255,255,0.2);">
				<img src={event.icon} alt="{event.title} icon" class="modal-icon-img" />
			</div>
			<h2 style="color: {event.textColor};">{event.title}</h2>
		</div>
		
		<div class="modal-body">
			<p class="description" style="color: {event.textColor};">
				{event.description}
			</p>
			
			<div class="meta-grid">
				<div class="meta-item" style="color: {event.textColor};">
					<span class="meta-icon">⏱</span>
					<div class="meta-content">
						<span class="meta-label">Estimated Time</span>
						<span class="meta-value">{event.et}</span>
					</div>
				</div>
				<div class="meta-item" style="color: {event.textColor};">
					<span class="meta-icon">📊</span>
					<div class="meta-content">
						<span class="meta-label">Difficulty</span>
						<span class="meta-value">{event.difficulty}</span>
					</div>
				</div>
			</div>
			
			<div class="button-row">
				<a 
					href={event.link} 
					class="action-btn primary" 
					style="background-color: {event.buttonColor}; color: {event.buttonTextColor};" 
					target="_blank" 
					rel="noopener noreferrer"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
						<polyline points="15 3 21 3 21 9"></polyline>
						<line x1="10" y1="14" x2="21" y2="3"></line>
					</svg>
					Learn More
				</a>
				{#if !event.noGuide}
					<a 
						href={event.guide} 
						class="action-btn secondary" 
						style="border-color: {event.buttonColor}; color: {event.textColor};" 
						target="_blank" 
						rel="noopener noreferrer"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="9" y1="3" x2="9" y2="21"></line>
						</svg>
						Tutorial
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(31, 45, 61, 0.7);
		backdrop-filter: blur(8px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: var(--z-modal, 1000);
		padding: var(--space-4, 16px);
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		border-radius: var(--radius-xl, 16px);
		padding: var(--space-8, 48px);
		max-width: 560px;
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 0.3s ease;
		box-shadow: var(--shadow-xl, 0 20px 40px rgba(31, 45, 61, 0.15));
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.close-button {
		position: absolute;
		top: var(--space-4, 16px);
		right: var(--space-4, 16px);
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.3);
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md, 8px);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		transition: all var(--transition-fast, 150ms ease);
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: scale(1.05);
	}

	.modal-header {
		margin-bottom: var(--space-6, 24px);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-4, 16px);
	}

	.modal-icon {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-lg, 12px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3, 12px);
	}

	.modal-icon-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.modal-header h2 {
		font-size: 2rem;
		margin: 0;
		padding-right: 50px;
		font-weight: 800;
		line-height: 1.2;
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-5, 20px);
	}

	.description {
		font-size: 1.0625rem;
		line-height: 1.6;
		margin: 0;
		font-weight: 500;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3, 12px);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--space-3, 12px);
		padding: var(--space-3, 12px);
		background: rgba(255, 255, 255, 0.15);
		border-radius: var(--radius-md, 8px);
	}

	.meta-icon {
		font-size: 1.25rem;
	}

	.meta-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.meta-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.8;
	}

	.meta-value {
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.button-row {
		display: flex;
		gap: var(--space-3, 12px);
		margin-top: var(--space-2, 8px);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2, 8px);
		flex: 1;
		text-align: center;
		padding: var(--space-4, 16px) var(--space-5, 20px);
		border-radius: var(--radius-md, 8px);
		font-size: 1rem;
		font-weight: 700;
		text-decoration: none;
		transition: all var(--transition-normal, 200ms ease);
		border: 2px solid transparent;
	}

	.action-btn.primary:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md, 0 4px 6px rgba(31, 45, 61, 0.07));
	}

	.action-btn.secondary {
		background: transparent;
	}

	.action-btn.secondary:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 640px) {
		.modal-content {
			padding: var(--space-6, 24px);
			max-height: 90vh;
		}

		.modal-header h2 {
			font-size: 1.5rem;
		}

		.modal-icon {
			width: 64px;
			height: 64px;
		}

		.meta-grid {
			grid-template-columns: 1fr;
		}

		.button-row {
			flex-direction: column;
		}

		.close-button {
			width: 40px;
			height: 40px;
		}
	}
</style>
