<script>
	import { page } from '$app/stores';
	
	const errorData = {
		400: {
			title: 'Bad Request',
			message: "Something's wrong with that request. Let's try again.",
			icon: '🤔',
			color: '#f59e0b'
		},
		401: {
			title: 'Not Authenticated',
			message: "You need to log in to access this page.",
			icon: '🔐',
			color: '#8b5cf6'
		},
		403: {
			title: 'Access Denied',
			message: "You don't have permission to view this page.",
			icon: '🚫',
			color: '#ef4444'
		},
		404: {
			title: 'Page Not Found',
			message: "We can't find the page you're looking for.",
			icon: '🦕',
			color: '#ec3750',
			useDino: true
		},
		429: {
			title: 'Slow Down!',
			message: "You're making requests too quickly. Take a breather.",
			icon: '⏳',
			color: '#f59e0b'
		},
		500: {
			title: 'Server Error',
			message: "Something went wrong on our end. We're working on it!",
			icon: '🔧',
			color: '#ec3750'
		},
		502: {
			title: 'Bad Gateway',
			message: "We're having trouble connecting. Please try again.",
			icon: '🌐',
			color: '#6366f1'
		},
		503: {
			title: 'Service Unavailable',
			message: "We're temporarily down for maintenance. Check back soon!",
			icon: '🛠️',
			color: '#8b5cf6'
		}
	};
	
	$: status = $page.status || 500;
	$: error = errorData[status] || {
		title: 'Something Went Wrong',
		message: $page.error?.message || "An unexpected error occurred.",
		icon: '❌',
		color: '#ec3750'
	};
</script>

<svelte:head>
	<title>{status} – {error.title} | Hack Club Leaders Portal</title>
</svelte:head>

<div class="error-page">
	<div class="error-container">
		{#if error.useDino}
			<img src="https://hackclub.com/404/dinobox.svg" alt="Hack Club Dino" class="dino" />
		{:else}
			<div class="error-icon" style="--icon-color: {error.color}">
				{error.icon}
			</div>
		{/if}
		
		<h1 class="error-code" data-text="{status}!" style="--accent-color: {error.color}">
			{status}!
		</h1>
		
		<h2 class="error-title">{error.title}</h2>
		<p class="error-message">{error.message}</p>
		
		{#if $page.error?.message && $page.error.message !== error.message}
			<div class="error-details">
				<p>{$page.error.message}</p>
			</div>
		{/if}
		
		<div class="error-actions">
			<a href="/" class="btn primary">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				Go Home
			</a>
			<button class="btn secondary" onclick={() => history.back()}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
					<line x1="19" y1="12" x2="5" y2="12"></line>
					<polyline points="12 19 5 12 12 5"></polyline>
				</svg>
				Go Back
			</button>
		</div>
		
		{#if status === 401}
			<a href="/auth/login" class="login-link">
				Sign in to continue →
			</a>
		{/if}
	</div>
	
	<!-- Decorative elements -->
	<div class="decoration decoration-1" style="--deco-color: {error.color}"></div>
	<div class="decoration decoration-2" style="--deco-color: {error.color}"></div>
	<div class="decoration decoration-3"></div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: linear-gradient(135deg, #f9fafc 0%, #eef1f6 100%);
		font-family: 'Phantom Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		position: relative;
		overflow: hidden;
	}
	
	.error-container {
		max-width: 480px;
		width: 100%;
		text-align: center;
		position: relative;
		z-index: 1;
	}
	
	.dino {
		height: 160px;
		max-width: 100%;
		margin: 0 auto 16px auto;
		display: block;
		animation: float 3s ease-in-out infinite;
	}
	
	@media (min-width: 640px) {
		.dino {
			height: 200px;
		}
	}
	
	.error-icon {
		font-size: 80px;
		margin-bottom: 16px;
		animation: float 3s ease-in-out infinite;
		filter: drop-shadow(0 4px 12px color-mix(in srgb, var(--icon-color) 30%, transparent));
	}
	
	@media (min-width: 640px) {
		.error-icon {
			font-size: 100px;
		}
	}
	
	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	
	.error-code {
		font-size: 72px;
		font-weight: 900;
		color: #1f2d3d;
		margin: 0 0 8px 0;
		line-height: 1;
		position: relative;
		display: inline-block;
	}
	
	@media (min-width: 640px) {
		.error-code {
			font-size: 96px;
		}
	}
	
	.error-code::before,
	.error-code::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #f9fafc 0%, #eef1f6 100%);
		overflow: hidden;
	}
	
	.error-code::before {
		left: 2px;
		text-shadow: -2px 0 var(--accent-color, #ec3750);
		animation: glitch-1 3s infinite linear alternate-reverse;
		clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
	}
	
	.error-code::after {
		left: -2px;
		text-shadow: 2px 0 #338eda;
		animation: glitch-2 2s infinite linear alternate-reverse;
		clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
	}
	
	@keyframes glitch-1 {
		0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%); }
		25% { clip-path: polygon(0 10%, 100% 10%, 100% 45%, 0 45%); }
		50% { clip-path: polygon(0 5%, 100% 5%, 100% 40%, 0 40%); }
		75% { clip-path: polygon(0 15%, 100% 15%, 100% 50%, 0 50%); }
	}
	
	@keyframes glitch-2 {
		0%, 100% { clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%); }
		33% { clip-path: polygon(0 55%, 100% 55%, 100% 90%, 0 90%); }
		66% { clip-path: polygon(0 70%, 100% 70%, 100% 100%, 0 100%); }
	}
	
	.error-title {
		font-size: 24px;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}
	
	@media (min-width: 640px) {
		.error-title {
			font-size: 28px;
		}
	}
	
	.error-message {
		font-size: 16px;
		color: #8492a6;
		margin: 0 0 24px 0;
		line-height: 1.5;
	}
	
	@media (min-width: 640px) {
		.error-message {
			font-size: 18px;
		}
	}
	
	.error-details {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		padding: 12px 16px;
		margin-bottom: 24px;
	}
	
	.error-details p {
		margin: 0;
		font-size: 14px;
		color: #991b1b;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
	}
	
	.error-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}
	
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		font-size: 16px;
		font-weight: 600;
		font-family: inherit;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		border: none;
	}
	
	.btn.primary {
		background: linear-gradient(135deg, #ff8c37 0%, #ec3750 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(236, 55, 80, 0.3);
	}
	
	.btn.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(236, 55, 80, 0.4);
	}
	
	.btn.secondary {
		background: white;
		color: #1f2d3d;
		border: 2px solid #e0e6ed;
	}
	
	.btn.secondary:hover {
		border-color: #8492a6;
		background: #f9fafc;
	}
	
	.login-link {
		display: inline-block;
		margin-top: 24px;
		color: #338eda;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s;
	}
	
	.login-link:hover {
		color: #2563eb;
		text-decoration: underline;
	}
	
	/* Decorative elements */
	.decoration {
		position: absolute;
		border-radius: 50%;
		opacity: 0.1;
		pointer-events: none;
	}
	
	.decoration-1 {
		width: 400px;
		height: 400px;
		background: var(--deco-color, #ec3750);
		top: -200px;
		right: -100px;
	}
	
	.decoration-2 {
		width: 300px;
		height: 300px;
		background: var(--deco-color, #ec3750);
		bottom: -150px;
		left: -100px;
	}
	
	.decoration-3 {
		width: 150px;
		height: 150px;
		background: #338eda;
		bottom: 20%;
		right: 10%;
		opacity: 0.08;
	}
	
	@media (max-width: 640px) {
		.decoration {
			display: none;
		}
	}
</style>
