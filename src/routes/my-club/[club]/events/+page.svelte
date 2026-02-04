<script>
	import RefreshButton from '$lib/RefreshButton.svelte';
	import Modal from '$lib/Modal.svelte';
	import ConfirmModal from '$lib/ConfirmModal.svelte';
	import { mergeClubData } from '$lib/club-utils.js';
	import { toasts } from '$lib/stores/toast.js';
	
	let { data, form } = $props();
	let club = $state(data.club);
	let events = $state(data.events || []);

	function handleRefresh(refreshedClub) {
		club = mergeClubData(club, refreshedClub);
	}

	// Calendar state
	let currentDate = $state(new Date());
	let selectedDate = $state(null);

	// Modal state
	let showEventModal = $state(false);
	let editingEvent = $state(null);
	let eventForm = $state({
		title: '',
		description: '',
		eventDate: '',
		eventTime: '',
		location: ''
	});
	let isSaving = $state(false);

	// View mode
	let viewMode = $state('calendar'); // 'calendar' or 'list'

	$effect(() => {
		if (form?.createSuccess) {
			toasts.success('Event created successfully!');
			closeEventModal();
			window.location.reload();
		}
		if (form?.updateSuccess) {
			toasts.success('Event updated successfully!');
			closeEventModal();
			window.location.reload();
		}
		if (form?.deleteSuccess) {
			toasts.success('Event deleted');
			window.location.reload();
		}
		if (form?.error) {
			toasts.error(form.error);
			isSaving = false;
		}
	});

	// Calendar helpers
	function getDaysInMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	}

	function getFirstDayOfMonth(date) {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	}

	function prevMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	function goToToday() {
		currentDate = new Date();
	}

	function formatMonthYear(date) {
		return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { 
			weekday: 'short',
			year: 'numeric', 
			month: 'short', 
			day: 'numeric'
		});
	}

	function formatTime(timeStr) {
		if (!timeStr) return '';
		const [hours, minutes] = timeStr.split(':');
		const date = new Date();
		date.setHours(parseInt(hours), parseInt(minutes));
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	function getEventsForDate(year, month, day) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		return events.filter(e => e.event_date === dateStr);
	}

	function isToday(year, month, day) {
		const today = new Date();
		return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
	}

	function isPast(year, month, day) {
		const date = new Date(year, month, day);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date < today;
	}

	// Computed calendar data
	let calendarDays = $derived.by(() => {
		const days = [];
		const daysInMonth = getDaysInMonth(currentDate);
		const firstDay = getFirstDayOfMonth(currentDate);
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// Previous month padding
		const prevMonth = month === 0 ? 11 : month - 1;
		const prevYear = month === 0 ? year - 1 : year;
		const daysInPrevMonth = getDaysInMonth(new Date(prevYear, prevMonth, 1));
		
		for (let i = firstDay - 1; i >= 0; i--) {
			days.push({
				day: daysInPrevMonth - i,
				isCurrentMonth: false,
				year: prevYear,
				month: prevMonth
			});
		}

		// Current month
		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				day: i,
				isCurrentMonth: true,
				year,
				month
			});
		}

		// Next month padding
		const remainingDays = 42 - days.length; // 6 rows x 7 days
		const nextMonth = month === 11 ? 0 : month + 1;
		const nextYear = month === 11 ? year + 1 : year;
		
		for (let i = 1; i <= remainingDays; i++) {
			days.push({
				day: i,
				isCurrentMonth: false,
				year: nextYear,
				month: nextMonth
			});
		}

		return days;
	});

	let upcomingEvents = $derived(
		events
			.filter(e => new Date(e.event_date) >= new Date().setHours(0,0,0,0))
			.sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
	);

	let pastEvents = $derived(
		events
			.filter(e => new Date(e.event_date) < new Date().setHours(0,0,0,0))
			.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
	);

	// Modal functions
	function openNewEventModal(date = null) {
		editingEvent = null;
		const today = date || new Date();
		eventForm = {
			title: '',
			description: '',
			eventDate: date ? `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}` : today.toISOString().split('T')[0],
			eventTime: '',
			location: ''
		};
		showEventModal = true;
	}

	function openEditEventModal(event) {
		editingEvent = event;
		eventForm = {
			title: event.title,
			description: event.description || '',
			eventDate: event.event_date,
			eventTime: event.event_time || '',
			location: event.location || ''
		};
		showEventModal = true;
	}

	function closeEventModal() {
		showEventModal = false;
		editingEvent = null;
		isSaving = false;
	}

	// Delete confirm state
	let showDeleteConfirm = $state(false);
	let deleteId = $state(null);
	let deleteFormRef = $state(null);

	function openDeleteConfirm(id, formElement) {
		deleteId = id;
		deleteFormRef = formElement;
		showDeleteConfirm = true;
	}

	function closeDeleteConfirm() {
		showDeleteConfirm = false;
		deleteId = null;
		deleteFormRef = null;
	}

	function handleDeleteConfirm() {
		if (deleteFormRef) {
			deleteFormRef.submit();
		}
		closeDeleteConfirm();
	}

	function handleDayClick(dayData) {
		if (dayData.isCurrentMonth && club.role === 'leader') {
			openNewEventModal(dayData);
		}
	}
</script>

<svelte:head>
	<title>Club Events - {club.name} - Hack Club</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-left">
			<a href="/my-club" class="back-link">← Back to My Club</a>
			<h1 class="page-title">{club.name}</h1>
			<p class="page-subtitle">Club Events</p>
		</div>
		<div class="header-buttons">
			<div class="view-toggle">
				<button 
					class="toggle-btn" 
					class:active={viewMode === 'calendar'}
					onclick={() => viewMode = 'calendar'}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
					Calendar
				</button>
				<button 
					class="toggle-btn" 
					class:active={viewMode === 'list'}
					onclick={() => viewMode = 'list'}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="8" y1="6" x2="21" y2="6"/>
						<line x1="8" y1="12" x2="21" y2="12"/>
						<line x1="8" y1="18" x2="21" y2="18"/>
						<line x1="3" y1="6" x2="3.01" y2="6"/>
						<line x1="3" y1="12" x2="3.01" y2="12"/>
						<line x1="3" y1="18" x2="3.01" y2="18"/>
					</svg>
					List
				</button>
			</div>
			<RefreshButton clubName={club.name} onRefresh={handleRefresh} />
			{#if club.role === 'leader'}
				<button type="button" class="primary-btn" onclick={() => openNewEventModal()}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"/>
						<line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
					New Event
				</button>
			{/if}
		</div>
	</header>

	<div class="content">
		{#if club.role !== 'leader'}
			<div class="info-banner">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="16" x2="12" y2="12"/>
					<line x1="12" y1="8" x2="12.01" y2="8"/>
				</svg>
				<span>Only club leaders can create and manage events.</span>
			</div>
		{/if}

		{#if viewMode === 'calendar'}
			<!-- Calendar View -->
			<div class="calendar-container">
				<div class="calendar-header">
					<button class="nav-btn" onclick={prevMonth}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="15 18 9 12 15 6"/>
						</svg>
					</button>
					<div class="month-year">
						<h2>{formatMonthYear(currentDate)}</h2>
						<button class="today-btn" onclick={goToToday}>Today</button>
					</div>
					<button class="nav-btn" onclick={nextMonth}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="9 18 15 12 9 6"/>
						</svg>
					</button>
				</div>

				<div class="calendar-grid">
					<div class="weekday-header">
						{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
							<div class="weekday">{day}</div>
						{/each}
					</div>
					<div class="days-grid">
						{#each calendarDays as dayData}
							{@const dayEvents = dayData.isCurrentMonth ? getEventsForDate(dayData.year, dayData.month, dayData.day) : []}
							<button 
								class="day-cell" 
								class:other-month={!dayData.isCurrentMonth}
								class:today={dayData.isCurrentMonth && isToday(dayData.year, dayData.month, dayData.day)}
								class:past={dayData.isCurrentMonth && isPast(dayData.year, dayData.month, dayData.day)}
								class:has-events={dayEvents.length > 0}
								onclick={() => handleDayClick(dayData)}
								disabled={!dayData.isCurrentMonth}
							>
								<span class="day-number">{dayData.day}</span>
								{#if dayEvents.length > 0}
									<div class="day-events">
										{#each dayEvents.slice(0, 2) as event}
											<button class="day-event" onclick={(e) => { e.stopPropagation(); openEditEventModal(event); }}>
												{event.title}
											</button>
										{/each}
										{#if dayEvents.length > 2}
											<div class="more-events">+{dayEvents.length - 2} more</div>
										{/if}
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<!-- List View -->
			<div class="list-view">
				{#if events.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
								<line x1="16" y1="2" x2="16" y2="6"/>
								<line x1="8" y1="2" x2="8" y2="6"/>
								<line x1="3" y1="10" x2="21" y2="10"/>
							</svg>
						</div>
						<h3>No events scheduled</h3>
						<p>Create your first club event to get started!</p>
						{#if club.role === 'leader'}
							<button type="button" class="primary-btn" onclick={() => openNewEventModal()}>
								Create First Event
							</button>
						{/if}
					</div>
				{:else}
					{#if upcomingEvents.length > 0}
						<section class="events-section">
							<h3>Upcoming Events</h3>
							<div class="events-list">
								{#each upcomingEvents as event}
									<div class="event-card">
										<div class="event-date-badge">
											<span class="event-month">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
											<span class="event-day">{new Date(event.event_date).getDate()}</span>
										</div>
										<div class="event-details">
											<h4>{event.title}</h4>
											<div class="event-meta">
												<span class="meta-item">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
														<line x1="16" y1="2" x2="16" y2="6"/>
														<line x1="8" y1="2" x2="8" y2="6"/>
														<line x1="3" y1="10" x2="21" y2="10"/>
													</svg>
													{formatDate(event.event_date)}
												</span>
												{#if event.event_time}
													<span class="meta-item">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<circle cx="12" cy="12" r="10"/>
															<polyline points="12 6 12 12 16 14"/>
														</svg>
														{formatTime(event.event_time)}
													</span>
												{/if}
												{#if event.location}
													<span class="meta-item">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
															<circle cx="12" cy="10" r="3"/>
														</svg>
														{event.location}
													</span>
												{/if}
											</div>
											{#if event.description}
												<p class="event-description">{event.description}</p>
											{/if}
										</div>
										{#if club.role === 'leader'}
											<div class="event-actions">
												<button class="edit-btn" onclick={() => openEditEventModal(event)}>
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
													</svg>
													Edit
												</button>
												<form method="POST" action="?/deleteEvent" class="delete-form">
													<input type="hidden" name="id" value={event.id} />
													<button type="button" class="delete-btn" onclick={(e) => { e.preventDefault(); openDeleteConfirm(event.id, e.target.closest('form')); }}>
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<polyline points="3 6 5 6 21 6"/>
															<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
														</svg>
														Delete
													</button>
												</form>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}

					{#if pastEvents.length > 0}
						<section class="events-section past-section">
							<h3>Past Events</h3>
							<div class="events-list">
								{#each pastEvents as event}
									<div class="event-card past">
										<div class="event-date-badge">
											<span class="event-month">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
											<span class="event-day">{new Date(event.event_date).getDate()}</span>
										</div>
										<div class="event-details">
											<h4>{event.title}</h4>
											<div class="event-meta">
												<span class="meta-item">{formatDate(event.event_date)}</span>
												{#if event.event_time}
													<span class="meta-item">{formatTime(event.event_time)}</span>
												{/if}
											</div>
										</div>
										{#if club.role === 'leader'}
											<div class="event-actions">
												<form method="POST" action="?/deleteEvent" class="delete-form">
													<input type="hidden" name="id" value={event.id} />
												<button type="button" class="delete-btn" onclick={(e) => { e.preventDefault(); openDeleteConfirm(event.id, e.target.closest('form')); }}>
													</button>
												</form>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Event Modal -->
<Modal open={showEventModal} title={editingEvent ? 'Edit Event' : 'New Event'} onClose={closeEventModal}>
	<form method="POST" action={editingEvent ? '?/updateEvent' : '?/createEvent'} onsubmit={() => isSaving = true}>
		{#if editingEvent}
			<input type="hidden" name="id" value={editingEvent.id} />
		{/if}

		<div class="form-group">
			<label for="title">Event Title <span class="required">*</span></label>
			<input 
				type="text" 
				id="title" 
				name="title" 
				bind:value={eventForm.title}
				placeholder="e.g., Weekly Hack Session"
				required
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="eventDate">Date <span class="required">*</span></label>
				<input 
					type="date" 
					id="eventDate" 
					name="eventDate" 
					bind:value={eventForm.eventDate}
					required
				/>
			</div>
			<div class="form-group">
				<label for="eventTime">Time</label>
				<input 
					type="time" 
					id="eventTime" 
					name="eventTime" 
					bind:value={eventForm.eventTime}
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="location">Location</label>
			<input 
				type="text" 
				id="location" 
				name="location" 
				bind:value={eventForm.location}
				placeholder="e.g., Room 204 or Zoom link"
			/>
		</div>
		
		<div class="form-group">
			<label for="description">Description</label>
			<textarea 
				id="description" 
				name="description" 
				bind:value={eventForm.description}
				placeholder="What's this event about?"
				rows="4"
			></textarea>
		</div>

		{#if !editingEvent}
			<div class="form-group checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" name="notifyMembers" checked />
					<span class="checkbox-text">
						<strong>Notify members via email</strong>
						<span class="checkbox-hint">Send an email notification to all club members and leaders</span>
					</span>
				</label>
			</div>
		{/if}

		<div class="modal-actions">
			<button type="button" class="cancel-btn" onclick={closeEventModal}>Cancel</button>
			<button type="submit" class="save-btn" disabled={isSaving || !eventForm.title.trim() || !eventForm.eventDate}>
				{#if isSaving}
					<span class="spinner"></span>
					Saving...
				{:else}
					{editingEvent ? 'Update Event' : 'Create Event'}
				{/if}
			</button>
		</div>
	</form>
</Modal>

<!-- Delete Confirmation Modal -->
<ConfirmModal 
	open={showDeleteConfirm}
	title="Delete Event"
	message="Are you sure you want to delete this event? This action cannot be undone."
	confirmText="Delete"
	variant="danger"
	onConfirm={handleDeleteConfirm}
	onCancel={closeDeleteConfirm}
/>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.back-link {
		color: #8492a6;
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #ec3750;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0;
	}

	.page-subtitle {
		font-size: 1rem;
		color: #8492a6;
		margin: 0;
	}

	.header-buttons {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.view-toggle {
		display: flex;
		background: #f0f2f5;
		border-radius: 8px;
		padding: 3px;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: #8492a6;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-btn.active {
		background: white;
		color: #1f2d3d;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.primary-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.primary-btn:hover {
		background: #d63045;
		transform: translateY(-1px);
	}

	.info-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: #f0f7ff;
		border: 1px solid #338eda;
		border-radius: 10px;
		color: #338eda;
		margin-bottom: 1.5rem;
	}

	/* Calendar Styles */
	.calendar-container {
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 16px;
		overflow: hidden;
	}

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e0e6ed;
	}

	.month-year {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.month-year h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0;
	}

	.today-btn {
		padding: 0.35rem 0.75rem;
		background: #f0f2f5;
		border: none;
		border-radius: 6px;
		color: #3c4858;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.today-btn:hover {
		background: #e0e6ed;
	}

	.nav-btn {
		padding: 0.5rem;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 8px;
		color: #3c4858;
		cursor: pointer;
		transition: all 0.2s;
	}

	.nav-btn:hover {
		background: #f0f2f5;
		border-color: #d0d6de;
	}

	.calendar-grid {
		padding: 1rem;
	}

	.weekday-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		margin-bottom: 0.5rem;
	}

	.weekday {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: #8492a6;
		padding: 0.5rem;
		text-transform: uppercase;
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.day-cell {
		aspect-ratio: 1;
		min-height: 80px;
		padding: 0.5rem;
		background: #f9fafc;
		border: 1px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	.day-cell:hover:not(:disabled) {
		background: #f0f2f5;
		border-color: #e0e6ed;
	}

	.day-cell.other-month {
		background: transparent;
		opacity: 0.4;
		cursor: default;
	}

	.day-cell.today {
		background: rgba(236, 55, 80, 0.1);
		border-color: #ec3750;
	}

	.day-cell.today .day-number {
		background: #ec3750;
		color: white;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.day-cell.past {
		opacity: 0.6;
	}

	.day-cell.has-events {
		background: #f0f7ff;
	}

	.day-number {
		font-size: 0.85rem;
		font-weight: 600;
		color: #1f2d3d;
	}

	.day-events {
		flex: 1;
		width: 100%;
		margin-top: 0.25rem;
		overflow: hidden;
	}

	.day-event {
		padding: 2px 4px;
		background: #338eda;
		color: white;
		font-size: 0.65rem;
		font-weight: 500;
		border-radius: 3px;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: pointer;
	}

	.day-event:hover {
		background: #2878c8;
	}

	.more-events {
		font-size: 0.65rem;
		color: #8492a6;
		font-weight: 500;
	}

	/* List View Styles */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: #f9fafc;
		border-radius: 16px;
		border: 2px dashed #e0e6ed;
	}

	.empty-icon {
		color: #8492a6;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.25rem;
		color: #1f2d3d;
		margin: 0 0 0.5rem;
	}

	.empty-state p {
		color: #8492a6;
		margin: 0 0 1.5rem;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.empty-icon {
		display: flex;
		justify-content: center;
	}

	.empty-state .primary-btn {
		margin: 0 auto;
	}

	.events-section {
		margin-bottom: 2rem;
	}

	.events-section h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #8492a6;
		margin: 0 0 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.past-section h3 {
		color: #a0aec0;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.event-card {
		display: flex;
		gap: 1rem;
		padding: 1.25rem;
		background: white;
		border: 1px solid #e0e6ed;
		border-radius: 12px;
		transition: all 0.2s;
	}

	.event-card:hover {
		border-color: #d0d6de;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.event-card.past {
		opacity: 0.6;
	}

	.event-date-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 50px;
		height: 50px;
		background: #ec3750;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.event-month {
		font-size: 0.65rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
	}

	.event-day {
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		line-height: 1;
	}

	.event-details {
		flex: 1;
		min-width: 0;
	}

	.event-details h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2d3d;
		margin: 0 0 0.25rem;
	}

	.event-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: #8492a6;
	}

	.event-description {
		font-size: 0.875rem;
		color: #3c4858;
		margin: 0;
		line-height: 1.5;
	}

	.event-actions {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.edit-btn,
	.delete-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		background: transparent;
		border: 1px solid #e0e6ed;
		border-radius: 6px;
		color: #8492a6;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-btn:hover {
		background: #f0f7ff;
		border-color: #338eda;
		color: #338eda;
	}

	.delete-btn:hover {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}

	.delete-form {
		margin: 0;
	}

	/* Modal Styles */
	.modal-content {
		padding: 0.5rem;
	}

	.modal-content h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2d3d;
		margin: 0 0 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		display: block;
		font-weight: 600;
		color: #1f2d3d;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.required {
		color: #ec3750;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #e0e6ed;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #ec3750;
		box-shadow: 0 0 0 3px rgba(236, 55, 80, 0.1);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.cancel-btn {
		padding: 0.75rem 1.25rem;
		background: #f9fafc;
		border: 1px solid #e0e6ed;
		border-radius: 8px;
		color: #3c4858;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn:hover {
		background: #f0f2f5;
	}

	.save-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #ec3750;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-btn:hover:not(:disabled) {
		background: #d63045;
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Dark mode */
	:global(.dark) .page-title {
		color: #f9fafc;
	}

	:global(.dark) .calendar-container {
		background: #1a1a2e;
		border-color: #2d2d44;
	}

	:global(.dark) .calendar-header {
		border-color: #2d2d44;
	}

	:global(.dark) .month-year h2 {
		color: #f9fafc;
	}

	:global(.dark) .today-btn {
		background: #2d2d44;
		color: #f9fafc;
	}

	:global(.dark) .nav-btn {
		background: #2d2d44;
		border-color: #3d3d54;
		color: #f9fafc;
	}

	:global(.dark) .day-cell {
		background: #252538;
	}

	:global(.dark) .day-cell:hover:not(:disabled) {
		background: #2d2d44;
	}

	:global(.dark) .day-number {
		color: #f9fafc;
	}

	:global(.dark) .view-toggle {
		background: #2d2d44;
	}

	:global(.dark) .toggle-btn {
		color: #8492a6;
	}

	:global(.dark) .toggle-btn.active {
		background: #1a1a2e;
		color: #f9fafc;
	}

	:global(.dark) .empty-state {
		background: #1a1a2e;
		border-color: #2d2d44;
	}

	:global(.dark) .empty-state h3 {
		color: #f9fafc;
	}

	:global(.dark) .event-card {
		background: #1a1a2e;
		border-color: #2d2d44;
	}

	:global(.dark) .event-details h4 {
		color: #f9fafc;
	}

	:global(.dark) .event-description {
		color: #c0ccda;
	}

	:global(.dark) .modal-content h2 {
		color: #f9fafc;
	}

	:global(.dark) .form-group label {
		color: #f9fafc;
	}

	:global(.dark) .form-group input,
	:global(.dark) .form-group textarea {
		background: #1a1a2e;
		border-color: #2d2d44;
		color: #f9fafc;
	}

	:global(.dark) .cancel-btn {
		background: #2d2d44;
		border-color: #3d3d54;
		color: #f9fafc;
	}

	:global(.dark) .edit-btn,
	:global(.dark) .delete-btn {
		border-color: #2d2d44;
	}

	:global(.dark) .info-banner {
		background: rgba(51, 142, 218, 0.1);
	}

	.checkbox-group {
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
	}

	.checkbox-label input[type="checkbox"] {
		width: 18px;
		height: 18px;
		margin-top: 2px;
		accent-color: #ec3750;
		cursor: pointer;
	}

	.checkbox-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.checkbox-text strong {
		font-size: 0.9rem;
		color: #1f2d3d;
	}

	.checkbox-hint {
		font-size: 0.8rem;
		color: #8492a6;
	}

	:global(.dark) .checkbox-text strong {
		color: #f9fafc;
	}

	:global(.dark) .checkbox-hint {
		color: #8492a6;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		header {
			flex-direction: column;
		}

		.header-buttons {
			width: 100%;
		}

		.day-cell {
			min-height: 60px;
			padding: 0.25rem;
		}

		.day-events {
			display: none;
		}

		.day-cell.has-events::after {
			content: '';
			display: block;
			width: 6px;
			height: 6px;
			background: #338eda;
			border-radius: 50%;
			margin-top: 0.25rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.event-card {
			flex-direction: column;
		}

		.event-actions {
			margin-top: 0.75rem;
		}
	}
</style>
