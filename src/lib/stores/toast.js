import { writable } from 'svelte/store';

function createToastStore() {
	const { subscribe, update } = writable([]);
	let idCounter = 0;
	
	function addToast({ type, message, duration }) {
		const id = ++idCounter;
		const toast = { id, type, message };
		
		update(toasts => [...toasts, toast]);
		
		if (duration > 0) {
			setTimeout(() => removeToast(id), duration);
		}
		
		return id;
	}
	
	function removeToast(id) {
		update(toasts => toasts.filter(t => t.id !== id));
	}
	
	return {
		subscribe,
		success: (message, duration = 4000) => addToast({ type: 'success', message, duration }),
		error: (message, duration = 5000) => addToast({ type: 'error', message, duration }),
		info: (message, duration = 4000) => addToast({ type: 'info', message, duration }),
		warning: (message, duration = 4500) => addToast({ type: 'warning', message, duration }),
		remove: removeToast,
		clear: () => update(() => [])
	};
}

export const toasts = createToastStore();
