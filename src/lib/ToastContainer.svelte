<script>
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toasts } from './stores/toast.js';
	
	let toastList = $state([]);
	
	$effect(() => {
		const unsubscribe = toasts.subscribe(value => {
			toastList = value;
		});
		return unsubscribe;
	});
	
	function getIcon(type) {
		switch (type) {
			case 'success': return '✓';
			case 'error': return '✕';
			case 'warning': return '⚠';
			case 'info': return 'ℹ';
			default: return '';
		}
	}
</script>

<div class="toast-container" aria-live="polite" aria-atomic="true">
	{#each toastList as toast (toast.id)}
		<div 
			class="toast toast-{toast.type}"
			role="alert"
			in:fly={{ x: 100, duration: 300 }}
			out:fade={{ duration: 200 }}
			animate:flip={{ duration: 200 }}
		>
			<span class="toast-icon">{getIcon(toast.type)}</span>
			<span class="toast-message">{toast.message}</span>
			<button 
				class="toast-close" 
				onclick={() => toasts.remove(toast.id)}
				aria-label="Dismiss notification"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 400px;
		pointer-events: none;
	}
	
	.toast {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 12px;
		background: white;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
		border-left: 4px solid;
		pointer-events: auto;
		animation: slideInRight 0.3s ease-out;
	}
	
	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(100px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.toast-success {
		border-color: #33d6a6;
		background: #f0fdf9;
	}
	
	.toast-error {
		border-color: #ec3750;
		background: #fef2f4;
	}
	
	.toast-warning {
		border-color: #f59e0b;
		background: #fffbeb;
	}
	
	.toast-info {
		border-color: #338eda;
		background: #eff6ff;
	}
	
	.toast-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.toast-success .toast-icon {
		background: #33d6a6;
		color: white;
	}
	
	.toast-error .toast-icon {
		background: #ec3750;
		color: white;
	}
	
	.toast-warning .toast-icon {
		background: #f59e0b;
		color: white;
	}
	
	.toast-info .toast-icon {
		background: #338eda;
		color: white;
	}
	
	.toast-message {
		flex: 1;
		font-size: 14px;
		font-weight: 500;
		color: #1f2d3d;
		line-height: 1.4;
	}
	
	.toast-close {
		background: none;
		border: none;
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
		color: #8492a6;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	
	.toast-close:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #1f2d3d;
	}
	
	@media (max-width: 480px) {
		.toast-container {
			left: 12px;
			right: 12px;
			max-width: none;
		}
	}
</style>
