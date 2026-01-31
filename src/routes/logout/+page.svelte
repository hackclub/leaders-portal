<script>
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Log Out - Club Leaders Portal</title>
</svelte:head>

<div class="logout-page">
	<div class="logout-card">
		<div class="icon-wrapper">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
				<polyline points="16 17 21 12 16 7"/>
				<line x1="21" y1="12" x2="9" y2="12"/>
			</svg>
		</div>
		
		<h1>Log Out</h1>
		<p>Are you sure you want to log out of the Club Leaders Portal?</p>
		
		<div class="actions">
			<form method="POST" use:enhance>
				<button type="submit" class="btn btn-primary">Yes, Log Out</button>
			</form>
			<a href="/" class="btn btn-secondary">Cancel</a>
		</div>
	</div>
</div>

<style>
	.logout-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: #f9fafc;
	}

	.logout-card {
		background: white;
		border-radius: 20px;
		padding: 48px;
		text-align: center;
		max-width: 400px;
		width: 100%;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	}

	.icon-wrapper {
		width: 80px;
		height: 80px;
		margin: 0 auto 24px;
		background: rgba(236, 55, 80, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ec3750;
	}

	h1 {
		margin: 0 0 12px;
		font-size: 1.5rem;
		color: #1f2d3d;
	}

	p {
		margin: 0 0 32px;
		color: #8492a6;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	form {
		display: contents;
	}

	.btn {
		display: block;
		width: 100%;
		padding: 14px 24px;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-primary {
		background: #ec3750;
		color: white;
	}

	.btn-primary:hover {
		background: #d32f44;
	}

	.btn-secondary {
		background: #f9fafc;
		color: #3c4858;
		border: 1px solid #e0e6ed;
	}

	.btn-secondary:hover {
		background: #e8ecf1;
	}
</style>
