<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { toasts } from '$lib/stores/toast.js';

	let canvasRef = $state(null);
	let isLoading = $state(true);
	let canvasWidth = $state(800);
	let canvasHeight = $state(1100);

	let activeTool = $state('select');

	let selectedTemplate = $state('blank');
	let templateImage = $state(null);

	let backgroundColor = $state('#ec3750');
	let backgroundType = $state('solid');
	let gradientColor1 = $state('#ec3750');
	let gradientColor2 = $state('#ff8c37');
	let gradientDirection = $state('vertical');

	let textElements = $state([]);
	let selectedElementId = $state(null);
	let newTextContent = $state('');
	let newTextColor = $state('#ffffff');
	let newTextSize = $state(48);
	let newTextFont = $state('Phantom Sans');
	let newTextBold = $state(true);

	let imageElements = $state([]);

	let shapeElements = $state([]);
	let newShapeType = $state('rectangle');
	let newShapeColor = $state('#ffffff');
	let newShapeBorderRadius = $state(0);

	let showQrCode = $state(false);
	let qrCodeUrl = $state('hack.club/join/your-club');
	let qrCodePosition = $state({ x: 650, y: 950 });
	let qrCodeSize = $state(120);
	let qrCodeImage = $state(null);

	let clubName = $state('Hack Club');
	let clubLocation = $state('Your School');

	let downloadFormat = $state('png');

	let isDragging = $state(false);
	let draggedElement = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });

	const templates = [
		{
			id: 'blank',
			name: 'Blank Canvas',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#ec3750',
				textElements: [],
				shapeElements: []
			}
		},
		{
			id: 'classic',
			name: 'Classic Hack Club',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#ec3750',
				textElements: [
					{ id: 1, content: 'JOIN', x: 400, y: 200, color: '#ffffff', size: 120, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 2, content: 'HACK CLUB', x: 400, y: 350, color: '#ffffff', size: 80, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'Learn to code. Build projects. Have fun.', x: 400, y: 500, color: '#ffffff', size: 28, font: 'Phantom Sans', bold: false, align: 'center' },
					{ id: 4, content: 'Every Tuesday after school in Room 205', x: 400, y: 900, color: '#ffffff', size: 24, font: 'Phantom Sans', bold: false, align: 'center' }
				],
				shapeElements: []
			}
		},
		{
			id: 'gradient',
			name: 'Gradient Style',
			preview: null,
			settings: {
				backgroundType: 'gradient',
				gradientColor1: '#ec3750',
				gradientColor2: '#ff8c37',
				gradientDirection: 'diagonal',
				textElements: [
					{ id: 1, content: '< HACK CLUB />', x: 400, y: 150, color: '#ffffff', size: 64, font: 'monospace', bold: true, align: 'center' },
					{ id: 2, content: 'Build the future.', x: 400, y: 300, color: '#ffffff', size: 48, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'No experience needed!', x: 400, y: 400, color: 'rgba(255,255,255,0.9)', size: 28, font: 'Phantom Sans', bold: false, align: 'center' }
				],
				shapeElements: []
			}
		},
		{
			id: 'minimalist',
			name: 'Minimalist',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#1f2d3d',
				textElements: [
					{ id: 1, content: 'HACK', x: 400, y: 300, color: '#ec3750', size: 140, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 2, content: 'CLUB', x: 400, y: 450, color: '#ffffff', size: 140, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'Code together. Build together.', x: 400, y: 600, color: '#8492a6', size: 24, font: 'Phantom Sans', bold: false, align: 'center' }
				],
				shapeElements: [
					{ id: 1, type: 'rectangle', x: 100, y: 700, width: 600, height: 4, color: '#ec3750', borderRadius: 2 }
				]
			}
		},
		{
			id: 'retro',
			name: 'Retro Terminal',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#0d1117',
				textElements: [
					{ id: 1, content: '$ join hack-club', x: 400, y: 200, color: '#33d6a6', size: 48, font: 'monospace', bold: true, align: 'center' },
					{ id: 2, content: '> Initializing awesome...', x: 400, y: 300, color: '#33d6a6', size: 32, font: 'monospace', bold: false, align: 'center' },
					{ id: 3, content: '> Loading projects...', x: 400, y: 360, color: '#33d6a6', size: 32, font: 'monospace', bold: false, align: 'center' },
					{ id: 4, content: '> Making friends... ✓', x: 400, y: 420, color: '#33d6a6', size: 32, font: 'monospace', bold: false, align: 'center' },
					{ id: 5, content: 'HACK CLUB', x: 400, y: 600, color: '#ec3750', size: 80, font: 'monospace', bold: true, align: 'center' }
				],
				shapeElements: [
					{ id: 1, type: 'rectangle', x: 50, y: 50, width: 700, height: 1000, color: 'transparent', borderRadius: 12, borderColor: '#33d6a6', borderWidth: 3 }
				]
			}
		},
		{
			id: 'bold',
			name: 'Bold Statement',
			preview: null,
			settings: {
				backgroundType: 'gradient',
				gradientColor1: '#338eda',
				gradientColor2: '#5c4dd6',
				gradientDirection: 'vertical',
				textElements: [
					{ id: 1, content: 'BUILD', x: 400, y: 200, color: '#ffffff', size: 120, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 2, content: 'SOMETHING', x: 400, y: 340, color: '#ffffff', size: 100, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'AWESOME', x: 400, y: 470, color: '#ffffff', size: 100, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 4, content: 'Join Hack Club', x: 400, y: 650, color: 'rgba(255,255,255,0.8)', size: 36, font: 'Phantom Sans', bold: false, align: 'center' }
				],
				shapeElements: []
			}
		},
		{
			id: 'workshop',
			name: 'Workshop Event',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#ffffff',
				textElements: [
					{ id: 1, content: '🚀 WORKSHOP', x: 400, y: 120, color: '#ec3750', size: 56, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 2, content: 'Build Your First Website', x: 400, y: 250, color: '#1f2d3d', size: 48, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'Learn HTML, CSS & JavaScript', x: 400, y: 350, color: '#8492a6', size: 28, font: 'Phantom Sans', bold: false, align: 'center' },
					{ id: 4, content: 'Friday, 3:30 PM', x: 400, y: 500, color: '#1f2d3d', size: 36, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 5, content: 'Room 205', x: 400, y: 560, color: '#8492a6', size: 28, font: 'Phantom Sans', bold: false, align: 'center' },
					{ id: 6, content: 'hack.club/your-club', x: 400, y: 950, color: '#ec3750', size: 32, font: 'Phantom Sans', bold: true, align: 'center' }
				],
				shapeElements: [
					{ id: 1, type: 'rectangle', x: 50, y: 50, width: 700, height: 1000, color: 'transparent', borderRadius: 0, borderColor: '#ec3750', borderWidth: 8 }
				]
			}
		},
		{
			id: 'neon',
			name: 'Neon Nights',
			preview: null,
			settings: {
				backgroundType: 'solid',
				backgroundColor: '#0a0a0a',
				textElements: [
					{ id: 1, content: 'HACK', x: 400, y: 280, color: '#ff00ff', size: 140, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 2, content: 'CLUB', x: 400, y: 430, color: '#00ffff', size: 140, font: 'Phantom Sans', bold: true, align: 'center' },
					{ id: 3, content: 'Where code comes alive', x: 400, y: 580, color: '#ffffff', size: 28, font: 'Phantom Sans', bold: false, align: 'center' }
				],
				shapeElements: []
			}
		}
	];

	const fontOptions = [
		{ value: 'Phantom Sans', label: 'Phantom Sans' },
		{ value: 'Arial', label: 'Arial' },
		{ value: 'Georgia', label: 'Georgia' },
		{ value: 'monospace', label: 'Monospace' },
		{ value: 'Comic Sans MS', label: 'Comic Sans' },
		{ value: 'Impact', label: 'Impact' }
	];

	onMount(() => {
		applyTemplate('classic');
	});

	function applyTemplate(templateId) {
		const template = templates.find(t => t.id === templateId);
		if (!template) return;

		selectedTemplate = templateId;
		
		if (template.settings.backgroundType) {
			backgroundType = template.settings.backgroundType;
		}
		if (template.settings.backgroundColor) {
			backgroundColor = template.settings.backgroundColor;
		}
		if (template.settings.gradientColor1) {
			gradientColor1 = template.settings.gradientColor1;
		}
		if (template.settings.gradientColor2) {
			gradientColor2 = template.settings.gradientColor2;
		}
		if (template.settings.gradientDirection) {
			gradientDirection = template.settings.gradientDirection;
		}
		
		textElements = template.settings.textElements ? [...template.settings.textElements.map(t => ({...t}))] : [];
		shapeElements = template.settings.shapeElements ? [...template.settings.shapeElements.map(s => ({...s}))] : [];
		
		isLoading = false;
		renderCanvas();
	}

	async function generateQrCode() {
		if (!showQrCode) {
			qrCodeImage = null;
			return;
		}
		try {
			const fullUrl = qrCodeUrl.startsWith('http') ? qrCodeUrl : `https://${qrCodeUrl}`;
			const dataUrl = await QRCode.toDataURL(fullUrl, {
				width: 300,
				margin: 1,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});
			const img = new Image();
			img.onload = () => {
				qrCodeImage = img;
				renderCanvas();
			};
			img.src = dataUrl;
		} catch (err) {
			console.error('Failed to generate QR code:', err);
		}
	}

	function renderCanvas() {
		if (!canvasRef) return;

		const ctx = canvasRef.getContext('2d');
		canvasRef.width = canvasWidth;
		canvasRef.height = canvasHeight;

		if (backgroundType === 'solid') {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		} else if (backgroundType === 'gradient') {
			let gradient;
			if (gradientDirection === 'vertical') {
				gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
			} else if (gradientDirection === 'horizontal') {
				gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
			} else {
				gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
			}
			gradient.addColorStop(0, gradientColor1);
			gradient.addColorStop(1, gradientColor2);
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		}

		for (const shape of shapeElements) {
			ctx.beginPath();
			if (shape.type === 'rectangle') {
				if (shape.borderRadius > 0) {
					roundRect(ctx, shape.x, shape.y, shape.width, shape.height, shape.borderRadius);
				} else {
					ctx.rect(shape.x, shape.y, shape.width, shape.height);
				}
				
				if (shape.color && shape.color !== 'transparent') {
					ctx.fillStyle = shape.color;
					ctx.fill();
				}
				
				if (shape.borderColor && shape.borderWidth) {
					ctx.strokeStyle = shape.borderColor;
					ctx.lineWidth = shape.borderWidth;
					ctx.stroke();
				}
			} else if (shape.type === 'circle') {
				ctx.arc(shape.x + shape.width/2, shape.y + shape.height/2, Math.min(shape.width, shape.height)/2, 0, Math.PI * 2);
				if (shape.color && shape.color !== 'transparent') {
					ctx.fillStyle = shape.color;
					ctx.fill();
				}
				if (shape.borderColor && shape.borderWidth) {
					ctx.strokeStyle = shape.borderColor;
					ctx.lineWidth = shape.borderWidth;
					ctx.stroke();
				}
			}
		}

		for (const text of textElements) {
			ctx.fillStyle = text.color;
			ctx.textAlign = text.align || 'center';
			ctx.textBaseline = 'middle';
			const fontWeight = text.bold ? 'bold' : 'normal';
			ctx.font = `${fontWeight} ${text.size}px "${text.font}", system-ui, sans-serif`;
			ctx.fillText(text.content, text.x, text.y);

			if (selectedElementId === `text-${text.id}`) {
				const metrics = ctx.measureText(text.content);
				const textWidth = metrics.width;
				const textHeight = text.size;
				let boxX = text.x - textWidth/2 - 10;
				if (text.align === 'left') boxX = text.x - 10;
				if (text.align === 'right') boxX = text.x - textWidth - 10;
				
				ctx.strokeStyle = '#338eda';
				ctx.lineWidth = 2;
				ctx.setLineDash([5, 5]);
				ctx.strokeRect(boxX, text.y - textHeight/2 - 5, textWidth + 20, textHeight + 10);
				ctx.setLineDash([]);
			}
		}

		if (showQrCode && qrCodeImage) {
			ctx.fillStyle = '#FFFFFF';
			const padding = 10;
			ctx.fillRect(qrCodePosition.x - padding, qrCodePosition.y - padding, qrCodeSize + padding * 2, qrCodeSize + padding * 2);
			ctx.drawImage(qrCodeImage, qrCodePosition.x, qrCodePosition.y, qrCodeSize, qrCodeSize);
		}
	}

	function roundRect(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	}

	function addTextElement() {
		if (!newTextContent.trim()) {
			toasts.error('Please enter some text');
			return;
		}
		
		const newId = Math.max(0, ...textElements.map(t => t.id)) + 1;
		textElements = [...textElements, {
			id: newId,
			content: newTextContent,
			x: canvasWidth / 2,
			y: canvasHeight / 2,
			color: newTextColor,
			size: newTextSize,
			font: newTextFont,
			bold: newTextBold,
			align: 'center'
		}];
		
		newTextContent = '';
		selectedElementId = `text-${newId}`;
		renderCanvas();
		toasts.success('Text added! Drag to position.');
	}

	function addShape() {
		const newId = Math.max(0, ...shapeElements.map(s => s.id)) + 1;
		shapeElements = [...shapeElements, {
			id: newId,
			type: newShapeType,
			x: canvasWidth / 2 - 100,
			y: canvasHeight / 2 - 50,
			width: 200,
			height: 100,
			color: newShapeColor,
			borderRadius: newShapeBorderRadius,
			borderColor: null,
			borderWidth: 0
		}];
		
		selectedElementId = `shape-${newId}`;
		renderCanvas();
		toasts.success('Shape added! Drag to position.');
	}

	function deleteSelectedElement() {
		if (!selectedElementId) return;
		
		if (selectedElementId.startsWith('text-')) {
			const id = parseInt(selectedElementId.replace('text-', ''));
			textElements = textElements.filter(t => t.id !== id);
		} else if (selectedElementId.startsWith('shape-')) {
			const id = parseInt(selectedElementId.replace('shape-', ''));
			shapeElements = shapeElements.filter(s => s.id !== id);
		}
		
		selectedElementId = null;
		renderCanvas();
		toasts.success('Element deleted');
	}

	function handleCanvasClick(e) {
		const rect = canvasRef.getBoundingClientRect();
		const scaleX = canvasWidth / rect.width;
		const scaleY = canvasHeight / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		const ctx = canvasRef.getContext('2d');
		for (const text of [...textElements].reverse()) {
			const fontWeight = text.bold ? 'bold' : 'normal';
			ctx.font = `${fontWeight} ${text.size}px "${text.font}", system-ui, sans-serif`;
			const metrics = ctx.measureText(text.content);
			const textWidth = metrics.width;
			const textHeight = text.size;
			
			let boxX = text.x - textWidth/2;
			if (text.align === 'left') boxX = text.x;
			if (text.align === 'right') boxX = text.x - textWidth;
			
			if (x >= boxX && x <= boxX + textWidth && y >= text.y - textHeight/2 && y <= text.y + textHeight/2) {
				selectedElementId = `text-${text.id}`;
				renderCanvas();
				return;
			}
		}

		for (const shape of [...shapeElements].reverse()) {
			if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
				selectedElementId = `shape-${shape.id}`;
				renderCanvas();
				return;
			}
		}

		selectedElementId = null;
		renderCanvas();
	}

	function handleCanvasMouseDown(e) {
		if (!selectedElementId) return;
		
		const rect = canvasRef.getBoundingClientRect();
		const scaleX = canvasWidth / rect.width;
		const scaleY = canvasHeight / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		if (selectedElementId.startsWith('text-')) {
			const id = parseInt(selectedElementId.replace('text-', ''));
			const text = textElements.find(t => t.id === id);
			if (text) {
				isDragging = true;
				draggedElement = { type: 'text', id };
				dragOffset = { x: x - text.x, y: y - text.y };
			}
		} else if (selectedElementId.startsWith('shape-')) {
			const id = parseInt(selectedElementId.replace('shape-', ''));
			const shape = shapeElements.find(s => s.id === id);
			if (shape) {
				isDragging = true;
				draggedElement = { type: 'shape', id };
				dragOffset = { x: x - shape.x, y: y - shape.y };
			}
		}
	}

	function handleCanvasMouseMove(e) {
		if (!isDragging || !draggedElement) return;

		const rect = canvasRef.getBoundingClientRect();
		const scaleX = canvasWidth / rect.width;
		const scaleY = canvasHeight / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		if (draggedElement.type === 'text') {
			textElements = textElements.map(t => 
				t.id === draggedElement.id ? { ...t, x: x - dragOffset.x, y: y - dragOffset.y } : t
			);
		} else if (draggedElement.type === 'shape') {
			shapeElements = shapeElements.map(s => 
				s.id === draggedElement.id ? { ...s, x: x - dragOffset.x, y: y - dragOffset.y } : s
			);
		}

		renderCanvas();
	}

	function handleCanvasMouseUp() {
		isDragging = false;
		draggedElement = null;
	}

	function downloadPoster() {
		if (!canvasRef) return;
		
		const tempSelected = selectedElementId;
		selectedElementId = null;
		renderCanvas();
		
		try {
			if (downloadFormat === 'png') {
				const link = document.createElement('a');
				link.download = `hack-club-poster-${Date.now()}.png`;
				link.href = canvasRef.toDataURL('image/png');
				link.click();
				toasts.success('Poster downloaded!');
			} else if (downloadFormat === 'jpg') {
				const link = document.createElement('a');
				link.download = `hack-club-poster-${Date.now()}.jpg`;
				link.href = canvasRef.toDataURL('image/jpeg', 0.95);
				link.click();
				toasts.success('Poster downloaded!');
			} else if (downloadFormat === 'pdf') {
				const imgData = canvasRef.toDataURL('image/png');
				const pdfWidth = 8.5;
				const pdfHeight = (canvasHeight / canvasWidth) * pdfWidth;
				
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
				toasts.info('Opening PDF print dialog...');
			}
		} catch (err) {
			toasts.error('Failed to download poster');
		}
		
		selectedElementId = tempSelected;
		renderCanvas();
	}

	function getSelectedText() {
		if (!selectedElementId?.startsWith('text-')) return null;
		const id = parseInt(selectedElementId.replace('text-', ''));
		return textElements.find(t => t.id === id);
	}

	function getSelectedShape() {
		if (!selectedElementId?.startsWith('shape-')) return null;
		const id = parseInt(selectedElementId.replace('shape-', ''));
		return shapeElements.find(s => s.id === id);
	}

	function updateSelectedText(property, value) {
		if (!selectedElementId?.startsWith('text-')) return;
		const id = parseInt(selectedElementId.replace('text-', ''));
		textElements = textElements.map(t => 
			t.id === id ? { ...t, [property]: value } : t
		);
		renderCanvas();
	}

	function updateSelectedShape(property, value) {
		if (!selectedElementId?.startsWith('shape-')) return;
		const id = parseInt(selectedElementId.replace('shape-', ''));
		shapeElements = shapeElements.map(s => 
			s.id === id ? { ...s, [property]: value } : s
		);
		renderCanvas();
	}

	$effect(() => {
		if (canvasRef) {
			renderCanvas();
		}
	});

	$effect(() => {
		if (showQrCode) {
			generateQrCode();
		} else {
			qrCodeImage = null;
			if (canvasRef) renderCanvas();
		}
	});

	$effect(() => {
		if (qrCodeUrl && showQrCode) {
			generateQrCode();
		}
	});
</script>

<svelte:head>
	<title>Poster Editor - Club Leaders Portal</title>
</svelte:head>

<div class="editor-container">
	<aside class="sidebar tools-sidebar">
		<div class="sidebar-header">
			<a href="/posters" class="back-link">← Back</a>
			<h2>Poster Editor <span class="beta-badge">BETA</span></h2>
		</div>

		<div class="tool-section">
			<h3>Templates</h3>
			<div class="template-grid">
				{#each templates as template}
					<button 
						class="template-btn" 
						class:active={selectedTemplate === template.id}
						onclick={() => applyTemplate(template.id)}
					>
						<span class="template-preview" style="background: {template.settings.backgroundColor || template.settings.gradientColor1}"></span>
						<span class="template-name">{template.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="tool-section">
			<h3>Background</h3>
			<div class="input-row">
				<label>Type</label>
				<select bind:value={backgroundType}>
					<option value="solid">Solid Color</option>
					<option value="gradient">Gradient</option>
				</select>
			</div>
			
			{#if backgroundType === 'solid'}
				<div class="input-row">
					<label>Color</label>
					<input type="color" bind:value={backgroundColor} />
				</div>
			{:else}
				<div class="input-row">
					<label>Color 1</label>
					<input type="color" bind:value={gradientColor1} />
				</div>
				<div class="input-row">
					<label>Color 2</label>
					<input type="color" bind:value={gradientColor2} />
				</div>
				<div class="input-row">
					<label>Direction</label>
					<select bind:value={gradientDirection}>
						<option value="vertical">Vertical</option>
						<option value="horizontal">Horizontal</option>
						<option value="diagonal">Diagonal</option>
					</select>
				</div>
			{/if}
		</div>

		<div class="tool-section">
			<h3>Add Text</h3>
			<div class="input-row">
				<input type="text" placeholder="Enter text..." bind:value={newTextContent} />
			</div>
			<div class="input-row compact">
				<input type="color" bind:value={newTextColor} title="Text color" />
				<input type="number" bind:value={newTextSize} min="12" max="200" title="Font size" />
				<select bind:value={newTextFont} title="Font">
					{#each fontOptions as font}
						<option value={font.value}>{font.label}</option>
					{/each}
				</select>
			</div>
			<div class="input-row">
				<label class="checkbox-inline">
					<input type="checkbox" bind:checked={newTextBold} />
					Bold
				</label>
			</div>
			<button class="btn btn-primary" onclick={addTextElement}>Add Text</button>
		</div>

		<div class="tool-section">
			<h3>Add Shape</h3>
			<div class="input-row compact">
				<select bind:value={newShapeType}>
					<option value="rectangle">Rectangle</option>
					<option value="circle">Circle</option>
				</select>
				<input type="color" bind:value={newShapeColor} title="Shape color" />
			</div>
			<div class="input-row">
				<label>Corner Radius</label>
				<input type="range" bind:value={newShapeBorderRadius} min="0" max="50" />
			</div>
			<button class="btn btn-secondary" onclick={addShape}>Add Shape</button>
		</div>

		<div class="tool-section">
			<h3>QR Code</h3>
			<label class="checkbox-inline">
				<input type="checkbox" bind:checked={showQrCode} />
				Show QR Code
			</label>
			{#if showQrCode}
				<div class="input-row">
					<label>URL</label>
					<input type="text" bind:value={qrCodeUrl} placeholder="hack.club/join/..." />
				</div>
				<div class="input-row">
					<label>Size</label>
					<input type="range" bind:value={qrCodeSize} min="80" max="200" />
				</div>
			{/if}
		</div>
	</aside>

	<main class="canvas-area">
		<div class="canvas-wrapper">
			<canvas 
				bind:this={canvasRef}
				class="poster-canvas"
				onclick={handleCanvasClick}
				onmousedown={handleCanvasMouseDown}
				onmousemove={handleCanvasMouseMove}
				onmouseup={handleCanvasMouseUp}
				onmouseleave={handleCanvasMouseUp}
			></canvas>
		</div>
	</main>

	<aside class="sidebar properties-sidebar">
		<div class="sidebar-header">
			<h2>Properties</h2>
		</div>

		{#if selectedElementId}
			{#if getSelectedText()}
				{@const text = getSelectedText()}
				<div class="property-section">
					<h3>Text Properties</h3>
					<div class="input-row">
						<label>Content</label>
						<input type="text" value={text.content} oninput={(e) => updateSelectedText('content', e.target.value)} />
					</div>
					<div class="input-row">
						<label>Color</label>
						<input type="color" value={text.color} oninput={(e) => updateSelectedText('color', e.target.value)} />
					</div>
					<div class="input-row">
						<label>Size</label>
						<input type="number" value={text.size} min="12" max="200" oninput={(e) => updateSelectedText('size', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>Font</label>
						<select value={text.font} onchange={(e) => updateSelectedText('font', e.target.value)}>
							{#each fontOptions as font}
								<option value={font.value}>{font.label}</option>
							{/each}
						</select>
					</div>
					<div class="input-row">
						<label>Align</label>
						<select value={text.align} onchange={(e) => updateSelectedText('align', e.target.value)}>
							<option value="left">Left</option>
							<option value="center">Center</option>
							<option value="right">Right</option>
						</select>
					</div>
					<div class="input-row">
						<label class="checkbox-inline">
							<input type="checkbox" checked={text.bold} onchange={(e) => updateSelectedText('bold', e.target.checked)} />
							Bold
						</label>
					</div>
					<div class="input-row">
						<label>X Position</label>
						<input type="number" value={Math.round(text.x)} oninput={(e) => updateSelectedText('x', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>Y Position</label>
						<input type="number" value={Math.round(text.y)} oninput={(e) => updateSelectedText('y', parseInt(e.target.value))} />
					</div>
					<button class="btn btn-danger" onclick={deleteSelectedElement}>Delete Text</button>
				</div>
			{:else if getSelectedShape()}
				{@const shape = getSelectedShape()}
				<div class="property-section">
					<h3>Shape Properties</h3>
					<div class="input-row">
						<label>Fill Color</label>
						<input type="color" value={shape.color === 'transparent' ? '#ffffff' : shape.color} oninput={(e) => updateSelectedShape('color', e.target.value)} />
					</div>
					<div class="input-row">
						<label>Width</label>
						<input type="number" value={shape.width} min="10" oninput={(e) => updateSelectedShape('width', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>Height</label>
						<input type="number" value={shape.height} min="10" oninput={(e) => updateSelectedShape('height', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>Corner Radius</label>
						<input type="range" value={shape.borderRadius} min="0" max="100" oninput={(e) => updateSelectedShape('borderRadius', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>X Position</label>
						<input type="number" value={Math.round(shape.x)} oninput={(e) => updateSelectedShape('x', parseInt(e.target.value))} />
					</div>
					<div class="input-row">
						<label>Y Position</label>
						<input type="number" value={Math.round(shape.y)} oninput={(e) => updateSelectedShape('y', parseInt(e.target.value))} />
					</div>
					<button class="btn btn-danger" onclick={deleteSelectedElement}>Delete Shape</button>
				</div>
			{/if}
		{:else}
			<div class="no-selection">
				<p>Click on an element to edit its properties</p>
			</div>
		{/if}

		<div class="download-section">
			<h3>Download</h3>
			<div class="input-row">
				<label>Format</label>
				<select bind:value={downloadFormat}>
					<option value="png">PNG</option>
					<option value="jpg">JPG</option>
					<option value="pdf">PDF</option>
				</select>
			</div>
			<button class="btn btn-primary btn-large" onclick={downloadPoster}>
				Download Poster
			</button>
		</div>
	</aside>
</div>

<style>
	.editor-container {
		display: grid;
		grid-template-columns: 280px 1fr 260px;
		height: 100vh;
		background: #1f2d3d;
	}

	.sidebar {
		background: #f9fafc;
		border-right: 1px solid #e0e6ed;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.properties-sidebar {
		border-right: none;
		border-left: 1px solid #e0e6ed;
	}

	.sidebar-header {
		padding: 16px;
		border-bottom: 1px solid #e0e6ed;
		background: white;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 16px;
		color: #1f2d3d;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.beta-badge {
		display: inline-block;
		padding: 2px 6px;
		background: linear-gradient(135deg, #ff8c37, #ec3750);
		color: white;
		font-size: 10px;
		font-weight: 700;
		border-radius: 4px;
		letter-spacing: 0.5px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 8px;
		color: #ec3750;
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
	}

	.back-link:hover {
		opacity: 0.8;
	}

	.tool-section, .property-section {
		padding: 16px;
		border-bottom: 1px solid #e0e6ed;
	}

	.tool-section h3, .property-section h3 {
		margin: 0 0 12px 0;
		font-size: 13px;
		font-weight: 700;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.template-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.template-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px;
		border: 2px solid #e0e6ed;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.template-btn:hover {
		border-color: #338eda;
	}

	.template-btn.active {
		border-color: #ec3750;
		background: rgba(236, 55, 80, 0.05);
	}

	.template-preview {
		width: 100%;
		height: 40px;
		border-radius: 4px;
	}

	.template-name {
		font-size: 11px;
		color: #1f2d3d;
		text-align: center;
	}

	.input-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 12px;
	}

	.input-row.compact {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	.input-row.compact input[type="color"] {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}

	.input-row.compact input[type="number"] {
		width: 60px;
	}

	.input-row.compact select {
		flex: 1;
	}

	.input-row label {
		font-size: 12px;
		font-weight: 600;
		color: #1f2d3d;
	}

	.input-row input[type="text"],
	.input-row input[type="number"],
	.input-row select {
		padding: 8px 10px;
		border: 1.5px solid #e0e6ed;
		border-radius: 6px;
		font-size: 13px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.input-row input:focus,
	.input-row select:focus {
		outline: none;
		border-color: #ec3750;
	}

	.input-row input[type="color"] {
		width: 100%;
		height: 36px;
		padding: 2px;
		border: 1.5px solid #e0e6ed;
		border-radius: 6px;
		cursor: pointer;
	}

	.input-row input[type="range"] {
		width: 100%;
	}

	.checkbox-inline {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 500;
		color: #1f2d3d;
		cursor: pointer;
	}

	.checkbox-inline input {
		width: 16px;
		height: 16px;
		accent-color: #ec3750;
	}

	.btn {
		padding: 10px 16px;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
	}

	.btn-primary {
		background: #ec3750;
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-secondary {
		background: #338eda;
		color: white;
	}

	.btn-secondary:hover {
		opacity: 0.9;
	}

	.btn-danger {
		background: #e03131;
		color: white;
	}

	.btn-danger:hover {
		opacity: 0.9;
	}

	.btn-large {
		padding: 14px 20px;
		font-size: 15px;
	}

	.canvas-area {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		overflow: auto;
	}

	.canvas-wrapper {
		background: #2d3748;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.poster-canvas {
		max-width: 100%;
		max-height: calc(100vh - 100px);
		width: auto;
		height: auto;
		display: block;
		cursor: crosshair;
		border-radius: 4px;
	}

	.no-selection {
		padding: 24px 16px;
		text-align: center;
	}

	.no-selection p {
		color: #8492a6;
		font-size: 13px;
		margin: 0;
	}

	.download-section {
		padding: 16px;
		margin-top: auto;
		border-top: 1px solid #e0e6ed;
		background: white;
		position: sticky;
		bottom: 0;
	}

	.download-section h3 {
		margin: 0 0 12px 0;
		font-size: 13px;
		font-weight: 700;
		color: #8492a6;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	@media (max-width: 1024px) {
		.editor-container {
			grid-template-columns: 240px 1fr 220px;
		}
	}

	@media (max-width: 768px) {
		.editor-container {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
			height: auto;
			min-height: 100vh;
		}

		.sidebar {
			border-right: none;
			border-bottom: 1px solid #e0e6ed;
		}

		.properties-sidebar {
			border-left: none;
			border-top: 1px solid #e0e6ed;
		}

		.canvas-area {
			min-height: 400px;
		}

		.template-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
