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
			name: 'Document Container Poster',
			previewImages: [
				'https://cdn.hackclub.com/019c25f5-51ab-7600-8984-88d46830c5bf/document_container.png',
				'https://cdn.hackclub.com/019c25ff-b344-7831-a2c5-a2a9b0c70481/back.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/019c264c-cd0d-7ceb-b6fb-0a3f3f5d21bc/Document%20Container.pdf'
				},
				{
					label: 'Back (With Bleed)',
					url: 'https://cdn.hackclub.com/019c2658-754f-7cef-8766-693fd12c3fea/back.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/jGaxkfh1WOHNZRnhQO9HtO/sprig?node-id=3001-769&t=ExdpPnJuR8quK4Xj-1'
			},
			credit: '@Krishna Bansal, Acon, & Cheru'
		},
		{
			name: 'Document Container Poster (Front Only)',
			previewImages: [
				'https://cdn.hackclub.com/019c25f5-51ab-7600-8984-88d46830c5bf/document_container.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/019c264c-cd0d-7ceb-b6fb-0a3f3f5d21bc/Document%20Container.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/jGaxkfh1WOHNZRnhQO9HtO/sprig?node-id=3001-769&t=ExdpPnJuR8quK4Xj-1'
			},
			credit: '@Krishna Bansal, Acon, & Cheru'
		},
		{
			name: 'Hack Club Poster (Image)',
			previewImages: [
				'https://cdn.hackclub.com/019c2605-7282-76ca-9aed-081d01fdbb25/image.png',
				'https://cdn.hackclub.com/019c2605-b1b2-79f2-801e-d949fa7f0317/image.png'
			],
			downloads: [
				{
					label: 'Front',
					url: 'https://cdn.hackclub.com/019c2605-7282-76ca-9aed-081d01fdbb25/image.png'
				},
				{
					label: 'Back',
					url: 'https://cdn.hackclub.com/019c2605-b1b2-79f2-801e-d949fa7f0317/image.png'
				}
			],
			sourceLink: null,
			credit: '@Krishna Bansal'
		},
		{
			name: 'OnBoard Poster',
			previewImages: [
				'https://cdn.hackclub.com/019c2612-7516-7e62-89ce-18eba9f6bcf7/image.png',
				'https://cdn.hackclub.com/019c2621-5259-73c8-815a-59e218364ec0/image.png'
			],
			downloads: [
				{
					label: 'Front',
					url: 'https://cdn.hackclub.com/019c2612-7516-7e62-89ce-18eba9f6bcf7/image.png'
				},
				{
					label: 'Back',
					url: 'https://cdn.hackclub.com/019c2621-5259-73c8-815a-59e218364ec0/image.png'
				},
				{
					label: 'Source Files',
					url: 'https://cdn.hackclub.com/rescue?url=https://cloud-3ol6zn29x-hack-club-bot.vercel.app/0hack_club_onboard.pdf'
				}
			],
			sourceLink: null,
			credit: 'Alex Hernandez'
		},
		{
			name: 'OnBoard Classroom Door Poster (Roman)',
			previewImages: [
				'https://cdn.hackclub.com/019c2625-8c1a-7080-a9d1-85f26862151f/onboard_classroom_door_poster_-_roman.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/019c2638-b7c7-7c1a-ab9d-327602f0be88/OnBoard%20Classroom%20Door%20Poster%20-%20Roman.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/file/EuyHDwjvZCHcQLTSU7oO0g/OnBoard-Classroom-Door-Poster?type=design&node-id=345%3A425&mode=design&t=7bzsFi9Ia2IdxL0G-1'
			},
			credit: 'Alex Hernandez'
		},
		{
			name: 'Boba Drops 1',
			previewImages: ['https://cdn.hackclub.com/019c2683-883e-7ec5-a4c7-d5c349cbe888/Poster.png'],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/019c2683-3ae8-738a-855c-0949455f0234/Poster-1.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/NOTPOSApwf87UwEEPsDuab/Boba-Finale?t=y3e9F3hOYteh5kUo-0'
			},
			credit: 'Max, Thomas, & Acon'
		},
		{
			name: 'Boba Drops 2',
			previewImages: ['https://cdn.hackclub.com/019c2683-883e-7ec5-a4c7-d5c349cbe888/Poster.png'],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/019c2683-3ae8-738a-855c-0949455f0234/Poster-1.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/0nw4F63yUkNAyt8eGTvH5E/posters?node-id=106-588&t=i0Li5rEtqiHpq29G-1'
			},
			credit: 'Acon & Max'
		},
		{
			name: 'Hack Club Pizza Poster',
			previewImages: [
				'https://cdn.hackclub.com/019c268f-0aad-7074-b4a6-70a2960a1d4e/Frame%203.png',
				'https://cdn.hackclub.com/019c26c6-99fb-75ea-b7dc-d8ff72c3efc5/Frame%205.png'
			],
			downloads: [
				{
					label: 'Frame 1',
					url: 'https://cdn.hackclub.com/019c268f-0aad-7074-b4a6-70a2960a1d4e/Frame%203.png'
				},
				{
					label: 'Frame 2',
					url: 'https://cdn.hackclub.com/019c26c6-99fb-75ea-b7dc-d8ff72c3efc5/Frame%205.png'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/DigahglUEW5HIq7GvfP9Ji/Hack-Club-Pizza?node-id=97-8&node-type=symbol&t=tIQR8nU7RrYcZUDF-0'
			},
			credit: 'Thomas'
		},
		{
			name: 'Cider Poster',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://cloud-lk08szl1f-hack-club-bot.vercel.app/2frame_5.jpg',
				'https://cdn.hackclub.com/rescue?url=https://cloud-lk08szl1f-hack-club-bot.vercel.app/1frame_4.jpg',
				'https://cdn.hackclub.com/rescue?url=https://cloud-lk08szl1f-hack-club-bot.vercel.app/0frame_3.jpg'
			],
			downloads: [
				{
					label: 'Frame 1',
					url: 'https://cdn.hackclub.com/rescue?url=https://cloud-lc1lo82df-hack-club-bot.vercel.app/2frame_5.pdf'
				},
				{
					label: 'Frame 2',
					url: 'https://cdn.hackclub.com/rescue?url=https://cloud-lc1lo82df-hack-club-bot.vercel.app/1frame_4.pdf'
				},
				{
					label: 'Frame 3',
					url: 'https://cdn.hackclub.com/rescue?url=https://cloud-lc1lo82df-hack-club-bot.vercel.app/0frame_3.pdf'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/A1h31wXwOudtDG512QibfD/Cider-Poster?node-id=0-1&t=WjPzl1w2wwVfW4Mo-1'
			},
			credit: 'Faisal, Cheru & Acon'
		},
		{
			name: 'Hackaccino Poster',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://cloud-acss4ewcx-hack-club-bot.vercel.app/0fraps_poster__1_large.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/rescue?url=https://cloud-g3sl3icfl-hack-club-bot.vercel.app/0fraps_poster__1.png'
				}
			],
			sourceLink: {
				label: 'Go to Figma',
				url: 'https://www.figma.com/design/ePWfewCPpMMnAv4N8yeqmS/Hackaccino-Poster?node-id=0-1&t=Ydwdpp3l7ZXzf8wQ-1'
			},
			credit: 'Gaurav'
		},
		{
			name: 'Lynn Beato Poster (Variant 1)',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/75b7fd75d4ea1f7edf05dfd0c488c18e613f952a_1.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/75b7fd75d4ea1f7edf05dfd0c488c18e613f952a_1.png'
				}
			],
			sourceLink: {
				label: 'Go to Canva',
				url: 'https://www.canva.com/design/DAGrSIMTk7Y/6SkSpsDnLJ2pxGLLmITxmA/edit'
			},
			credit: 'Lynn Beato'
		},
		{
			name: 'Lynn Beato Poster (Variant 2)',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/b7796249f723da990ad407fed16e9cfcc2b14fae_2.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/b7796249f723da990ad407fed16e9cfcc2b14fae_2.png'
				}
			],
			sourceLink: {
				label: 'Go to Canva',
				url: 'https://www.canva.com/design/DAGrSIMTk7Y/6SkSpsDnLJ2pxGLLmITxmA/edit'
			},
			credit: 'Lynn Beato'
		},
		{
			name: 'Lynn Beato Poster (Variant 3)',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/1177a013423bcc13c18c042ad76bf3099af6583a_3.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/1177a013423bcc13c18c042ad76bf3099af6583a_3.png'
				}
			],
			sourceLink: {
				label: 'Go to Canva',
				url: 'https://www.canva.com/design/DAGrSIMTk7Y/6SkSpsDnLJ2pxGLLmITxmA/edit'
			},
			credit: 'Lynn Beato'
		},
		{
			name: 'Lynn Beato Poster (Variant 4)',
			previewImages: [
				'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/618d0c946139534fe5c28a46190d5114a6042ada_4.png'
			],
			downloads: [
				{
					label: 'Front (With Bleed)',
					url: 'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/618d0c946139534fe5c28a46190d5114a6042ada_4.png'
				}
			],
			sourceLink: {
				label: 'Go to Canva',
				url: 'https://www.canva.com/design/DAGrSIMTk7Y/6SkSpsDnLJ2pxGLLmITxmA/edit'
			},
			credit: 'Lynn Beato'
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

	function downloadStaticPoster(url, name) {
		const link = document.createElement('a');
		const extension = getFileExtension(url);
		link.href = url;
		link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
		link.target = '_blank';
		link.click();
	}

	function getFileExtension(url) {
		const [baseUrl, queryString] = url.split('?');
		let candidate = baseUrl;
		if (queryString) {
			const params = new URLSearchParams(queryString);
			const nestedUrl = params.get('url');
			if (nestedUrl) {
				candidate = nestedUrl.split('?')[0];
			}
		}
		const extension = candidate.split('.').pop();
		return extension || 'png';
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
			<p class="section-description">Download these posters directly with credit to the original creators</p>
			
			<div class="poster-grid">
				{#each staticPosters as poster}
					<div class="poster-card">
						<div class="poster-preview-grid">
							{#each poster.previewImages as previewImage}
								<img 
									src={previewImage}
									alt={`${poster.name} preview`}
									class="poster-thumbnail"
									loading="lazy"
								/>
							{/each}
						</div>
						<p class="poster-title">{poster.name}</p>
						<p class="poster-credit">{poster.credit}</p>
						<div class="poster-actions">
							{#each poster.downloads as download}
								<button
									class="download-button small"
									onclick={() => downloadStaticPoster(download.url, `${poster.name}-${download.label}`)}
								>
									Download {download.label}
								</button>
							{/each}
							{#if poster.sourceLink}
								<a class="source-link" href={poster.sourceLink.url} target="_blank" rel="noreferrer">
									{poster.sourceLink.label}
								</a>
							{/if}
						</div>
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

	.poster-preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 12px;
	}

	.poster-title {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: #1f2d3d;
	}

	.poster-credit {
		margin: 0;
		font-size: 14px;
		color: #1f2d3d;
	}

	.poster-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.source-link {
		padding: 10px 16px;
		border: 2px solid #338eda;
		border-radius: 8px;
		color: #338eda;
		font-weight: 600;
		text-decoration: none;
		font-size: 14px;
		transition: opacity 0.2s;
	}

	.source-link:hover {
		opacity: 0.8;
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
