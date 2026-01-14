<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let customUrl = $state('hack.club/join/your-club');
	let canvasRef = $state(null);
	let posterImage = $state(null);
	let isLoading = $state(true);
	let downloadFormat = $state('png');
	let showQrCode = $state(false);
	let qrCodeImage = $state(null);

	const interactivePosterUrl = '/poster-template.png';
	
	const staticPosters = [
		{
			name: 'Poster 2',
			url: 'https://hc-cdn.hel1.your-objectstorage.com/s/v3/b7796249f723da990ad407fed16e9cfcc2b14fae_2.png'
		},
		{
			name: 'Poster 3',
			url: 'https://hc-cdn.hel1.your-objectstorage.com/s/v3/1177a013423bcc13c18c042ad76bf3099af6583a_3.png'
		},
		{
			name: 'Poster 4',
			url: 'https://hc-cdn.hel1.your-objectstorage.com/s/v3/618d0c946139534fe5c28a46190d5114a6042ada_4.png'
		}
	];

	onMount(() => {
		loadPosterImage();
	});

	function loadPosterImage() {
		isLoading = true;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			posterImage = img;
			isLoading = false;
			renderPoster();
		};
		img.onerror = () => {
			isLoading = false;
			console.error('Failed to load poster image');
		};
		img.src = interactivePosterUrl;
	}

	async function generateQrCode(url) {
		try {
			const fullUrl = url.startsWith('http') ? url : `https://${url}`;
			const dataUrl = await QRCode.toDataURL(fullUrl, {
				width: 200,
				margin: 1,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});
			const img = new Image();
			img.onload = () => {
				qrCodeImage = img;
				renderPoster();
			};
			img.src = dataUrl;
		} catch (err) {
			console.error('Failed to generate QR code:', err);
		}
	}

	function renderPoster() {
		if (!canvasRef || !posterImage) return;
		
		const ctx = canvasRef.getContext('2d');
		const width = posterImage.naturalWidth;
		const height = posterImage.naturalHeight;
		
		canvasRef.width = width;
		canvasRef.height = height;
		
		ctx.drawImage(posterImage, 0, 0, width, height);
		
		const boxX = width * 0.2327;
		const boxY = height * 0.8813;
		const boxWidth = width * 0.7091;
		const boxHeight = height * 0.0419;
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
		
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		
		const fontSize = Math.min(boxHeight * 0.6, boxWidth / (customUrl.length * 0.5));
		ctx.font = `bold ${fontSize}px "Phantom Sans", system-ui, sans-serif`;
		
		ctx.fillText(customUrl, boxX + boxWidth / 2, boxY + boxHeight / 2);

		if (showQrCode && qrCodeImage) {
			const qrSize = width * 0.12;
			const qrX = width * 0.85 - qrSize / 2;
			const qrY = height * 0.76 - qrSize / 2;
			
			ctx.fillStyle = '#FFFFFF';
			const padding = qrSize * 0.08;
			ctx.fillRect(qrX - padding, qrY - padding, qrSize + padding * 2, qrSize + padding * 2);
			
			ctx.drawImage(qrCodeImage, qrX, qrY, qrSize, qrSize);
		}
	}

	$effect(() => {
		if (posterImage && canvasRef) {
			if (showQrCode) {
				generateQrCode(customUrl);
			} else {
				qrCodeImage = null;
				renderPoster();
			}
		}
	});

	function downloadPoster() {
		if (!canvasRef) return;
		
		if (downloadFormat === 'png') {
			const link = document.createElement('a');
			link.download = `hack-club-poster-${Date.now()}.png`;
			link.href = canvasRef.toDataURL('image/png');
			link.click();
		} else if (downloadFormat === 'pdf') {
			const imgData = canvasRef.toDataURL('image/png');
			const width = canvasRef.width;
			const height = canvasRef.height;
			
			const pdfWidth = 8.5;
			const pdfHeight = (height / width) * pdfWidth;
			
			const windowContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Hack Club Poster</title>
					<style>
						@page { size: ${pdfWidth}in ${pdfHeight}in; margin: 0; }
						body { margin: 0; padding: 0; }
						img { width: 100%; height: auto; display: block; }
					</style>
				</head>
				<body>
					<img src="${imgData}" />
					<script>window.onload = function() { window.print(); window.close(); }<\/script>
				</body>
				</html>
			`;
			
			const printWindow = window.open('', '_blank');
			printWindow.document.write(windowContent);
			printWindow.document.close();
		}
	}

	function downloadStaticPoster(poster) {
		const link = document.createElement('a');
		link.href = poster.url;
		link.download = `${poster.name.toLowerCase().replace(/\s+/g, '-')}.png`;
		link.target = '_blank';
		link.click();
	}
</script>

<svelte:head>
	<title>Club Posters - Club Leaders Portal</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/" class="back-link">← Back to Portal</a>
		<h1 class="title">Club Posters</h1>
		<p class="subtitle">Download posters to promote your Hack Club</p>
	</header>

	<main>
		<section class="interactive-section">
			<h2>Custom Join Link Poster</h2>
			<p class="section-description">Add your custom club URL and download a personalized poster</p>
			
			<div class="poster-editor">
				<div class="canvas-container">
					{#if isLoading}
						<div class="loading">Loading poster...</div>
					{/if}
					<canvas 
						bind:this={canvasRef}
						class="poster-canvas"
						class:hidden={isLoading}
					></canvas>
				</div>
				
				<div class="controls">
					<div class="input-group">
						<label for="customUrl">Your Club URL</label>
						<input 
							type="text" 
							id="customUrl"
							bind:value={customUrl}
							placeholder="hack.club/join/your-club"
						/>
					</div>
					
					<div class="input-group checkbox-group">
						<label class="checkbox-label">
							<input 
								type="checkbox" 
								bind:checked={showQrCode}
							/>
							<span>Show QR Code</span>
						</label>
						<p class="input-hint">Adds a scannable QR code to the poster</p>
					</div>

					<div class="input-group">
						<label for="format">Download Format</label>
						<select id="format" bind:value={downloadFormat}>
							<option value="png">PNG Image</option>
							<option value="pdf">PDF Document</option>
						</select>
					</div>
					
					<button class="download-button" onclick={downloadPoster} disabled={isLoading}>
						Download as {downloadFormat.toUpperCase()}
					</button>
				</div>
			</div>
		</section>

		<section class="static-section">
			<h2>Additional Posters</h2>
			<p class="section-description">Download these posters directly</p>
			
			<div class="poster-grid">
				{#each staticPosters as poster}
					<div class="poster-card">
						<img 
							src={poster.url} 
							alt={poster.name}
							class="poster-thumbnail"
							loading="lazy"
						/>
						<button class="download-button small" onclick={() => downloadStaticPoster(poster)}>
							Download {poster.name}
						</button>
					</div>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	.container {
		max-width: 1024px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	header {
		text-align: center;
		margin-bottom: 40px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 16px;
		color: #ec3750;
		text-decoration: none;
		font-weight: 600;
		transition: opacity 0.2s;
	}

	.back-link:hover {
		opacity: 0.8;
	}

	.title {
		font-size: 48px;
		font-weight: bold;
		color: #ec3750;
		margin: 0 0 8px 0;
	}

	.subtitle {
		color: #8492a6;
		font-size: 18px;
		margin: 0;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	section h2 {
		font-size: 28px;
		color: #1f2d3d;
		margin: 0 0 8px 0;
	}

	.section-description {
		color: #8492a6;
		margin: 0 0 24px 0;
	}

	.interactive-section {
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 16px;
		padding: 32px;
	}

	.poster-editor {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 32px;
		align-items: start;
	}

	.canvas-container {
		position: relative;
		background: #e0e6ed;
		border-radius: 8px;
		overflow: hidden;
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.poster-canvas {
		max-width: 100%;
		height: auto;
		display: block;
	}

	.poster-canvas.hidden {
		display: none;
	}

	.loading {
		color: #8492a6;
		font-size: 16px;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.input-group label {
		font-weight: 600;
		color: #1f2d3d;
		font-size: 14px;
	}

	.input-group input,
	.input-group select {
		padding: 12px 16px;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		font-size: 16px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.input-group input:focus,
	.input-group select:focus {
		outline: none;
		border-color: #ec3750;
	}

	.checkbox-group {
		gap: 4px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		font-weight: 600;
		color: #1f2d3d;
	}

	.checkbox-label input[type="checkbox"] {
		width: 20px;
		height: 20px;
		accent-color: #ec3750;
		cursor: pointer;
	}

	.input-hint {
		margin: 0;
		font-size: 13px;
		color: #8492a6;
	}

	.download-button {
		padding: 14px 24px;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s;
	}

	.download-button:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(1.02);
	}

	.download-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.download-button.small {
		padding: 10px 16px;
		font-size: 14px;
	}

	.static-section {
		padding: 0;
	}

	.poster-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.poster-card {
		background: #f9fafc;
		border: 2px solid #e0e6ed;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		transition: transform 0.2s;
	}

	.poster-card:hover {
		transform: translateY(-4px);
	}

	.poster-thumbnail {
		width: 100%;
		height: auto;
		border-radius: 8px;
		display: block;
	}

	@media (max-width: 768px) {
		.container {
			padding: 16px 12px;
		}

		.title {
			font-size: 32px;
		}

		.poster-editor {
			grid-template-columns: 1fr;
		}

		.interactive-section {
			padding: 20px;
		}

		section h2 {
			font-size: 22px;
		}
	}
</style>
