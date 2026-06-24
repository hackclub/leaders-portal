<script>
	let { events = [], canEdit = false, onDayClick, onEventClick } = $props();

	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTHS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const now = new Date();
	let viewDate = $state(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
	let expanded = $state(false);

	function toKey(year, month, day) {
		return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	}

	function keyOf(date) {
		return toKey(date.getFullYear(), date.getMonth(), date.getDate());
	}

	const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());

	let eventsByDay = $derived.by(() => {
		const map = {};
		for (const event of events) {
			const key = (event.event_date || '').slice(0, 10);
			if (!key) continue;
			(map[key] ||= []).push(event);
		}
		for (const key of Object.keys(map)) {
			map[key].sort((a, b) => (a.event_time || '').localeCompare(b.event_time || ''));
		}
		return map;
	});

	function makeCell(date) {
		const key = keyOf(date);
		return { day: date.getDate(), key, events: eventsByDay[key] || [] };
	}

	let weeks = $derived.by(() => {
		if (expanded) {
			const year = viewDate.getFullYear();
			const month = viewDate.getMonth();
			const startOffset = new Date(year, month, 1).getDay();
			const daysInMonth = new Date(year, month + 1, 0).getDate();
			const cells = [];
			for (let i = 0; i < startOffset; i++) cells.push(null);
			for (let day = 1; day <= daysInMonth; day++) cells.push(makeCell(new Date(year, month, day)));
			while (cells.length % 7 !== 0) cells.push(null);
			const rows = [];
			for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
			return rows;
		}

		// Week view: the Sun–Sat week containing viewDate
		const weekStart = new Date(viewDate);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		const cells = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(weekStart);
			d.setDate(weekStart.getDate() + i);
			cells.push(makeCell(d));
		}
		return [cells];
	});

	let title = $derived.by(() => {
		if (expanded) {
			return `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
		}
		const weekStart = new Date(viewDate);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);
		const startMonth = MONTHS[weekStart.getMonth()].slice(0, 3);
		const endMonth = MONTHS[weekEnd.getMonth()].slice(0, 3);
		if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
			return `${startMonth} ${weekStart.getDate()}, ${weekStart.getFullYear()} – ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
		}
		if (weekStart.getMonth() !== weekEnd.getMonth()) {
			return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
		}
		return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
	});

	function shift(step) {
		const d = new Date(viewDate);
		if (expanded) {
			d.setMonth(d.getMonth() + step);
		} else {
			d.setDate(d.getDate() + step * 7);
		}
		viewDate = d;
	}

	function prev() {
		shift(-1);
	}

	function next() {
		shift(1);
	}

	function goToday() {
		viewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}

	function toggleExpanded() {
		expanded = !expanded;
	}

	function formatTime(time) {
		if (!time) return '';
		const [h, m] = String(time).split(':');
		const d = new Date();
		d.setHours(Number(h), Number(m), 0, 0);
		return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}

	function handleDayClick(cell) {
		if (!canEdit || !cell) return;
		onDayClick?.(cell.key);
	}

	function handleEventClick(e, event) {
		e.stopPropagation();
		onEventClick?.(event);
	}
</script>

<div class="calendar">
	<div class="calendar-header">
		<h3 class="calendar-title">{title}</h3>
		<div class="calendar-nav">
			<button type="button" class="nav-btn" onclick={toggleExpanded}>
				{expanded ? 'Week view' : 'View full month'}
			</button>
			<button type="button" class="nav-btn" onclick={goToday}>Today</button>
			<button type="button" class="nav-btn icon" onclick={prev} aria-label={expanded ? 'Previous month' : 'Previous week'}>‹</button>
			<button type="button" class="nav-btn icon" onclick={next} aria-label={expanded ? 'Next month' : 'Next week'}>›</button>
		</div>
	</div>

	<div class="weekday-row">
		{#each WEEKDAYS as weekday}
			<div class="weekday">{weekday}</div>
		{/each}
	</div>

	<div class="grid" class:week-view={!expanded}>
		{#each weeks as week}
			{#each week as cell}
				{#if cell}
					<div
						class="day-cell"
						class:today={cell.key === todayKey}
						class:editable={canEdit}
						class:has-events={cell.events.length > 0}
						role={canEdit ? 'button' : undefined}
						tabindex={canEdit ? 0 : undefined}
						onclick={() => handleDayClick(cell)}
						onkeydown={(e) => { if (canEdit && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleDayClick(cell); } }}
						title={canEdit ? 'Click to add an event' : undefined}
					>
						<span class="day-number">{cell.day}</span>
						<div class="day-events">
							{#each cell.events as event}
								<button
									type="button"
									class="event-chip"
									class:going={event.my_rsvp === 'going'}
									onclick={(e) => handleEventClick(e, event)}
									title={event.title}
								>
									{#if event.event_time}<span class="chip-time">{formatTime(event.event_time)}</span>{/if}
									<span class="chip-title">{event.title}</span>
									{#if event.my_rsvp === 'going'}<span class="chip-going" title="You're going">✓</span>{/if}
									{#if event.rsvp_count > 0}<span class="chip-rsvp" title="{event.rsvp_count} going">👥 {event.rsvp_count}</span>{/if}
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<div class="day-cell empty"></div>
				{/if}
			{/each}
		{/each}
	</div>

	{#if canEdit}
		<p class="calendar-hint">Click a day to schedule an event, or click an event to edit it.</p>
	{/if}
</div>

<style>
	.calendar {
		font-family: 'Phantom Sans', system-ui, sans-serif;
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.calendar-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.calendar-nav {
		display: flex;
		gap: 8px;
	}

	.nav-btn {
		padding: 6px 12px;
		border: 2px solid var(--color-border);
		background: var(--bg-card);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		transition: border-color 0.15s, color 0.15s;
	}

	.nav-btn:hover {
		border-color: #338eda;
		color: #338eda;
	}

	.nav-btn.icon {
		width: 36px;
		padding: 6px 0;
		font-size: 18px;
		line-height: 1;
	}

	.weekday-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		margin-bottom: 4px;
	}

	.weekday {
		text-align: center;
		font-size: 12px;
		font-weight: 700;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 4px 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.grid.week-view .day-cell {
		min-height: 140px;
	}

	.day-cell {
		min-height: 92px;
		background: var(--bg-sunken);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		overflow: hidden;
	}

	.day-cell.empty {
		background: transparent;
		border: none;
	}

	.day-cell.editable {
		cursor: pointer;
		transition: border-color 0.15s, background-color 0.15s;
	}

	.day-cell.editable:hover {
		border-color: #ec3750;
		background: light-dark(#fff5f7, rgba(236, 55, 80, 0.12));
	}

	.day-cell.today {
		border-color: #338eda;
	}

	.day-number {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
	}

	.day-cell.today .day-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		background: #338eda;
		color: #fff;
		border-radius: 50%;
	}

	.day-events {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.event-chip {
		display: flex;
		align-items: baseline;
		gap: 4px;
		width: 100%;
		text-align: left;
		padding: 3px 6px;
		background: #ec3750;
		color: #fff;
		border: none;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Phantom Sans', system-ui, sans-serif;
		overflow: hidden;
	}

	.event-chip:hover {
		background: #d63349;
	}

	.event-chip.going {
		background: #33d6a6;
	}

	.event-chip.going:hover {
		background: #2bbf94;
	}

	.chip-time {
		flex-shrink: 0;
		opacity: 0.85;
		font-weight: 700;
	}

	.chip-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.chip-going {
		flex-shrink: 0;
		font-weight: 700;
	}

	.chip-rsvp {
		flex-shrink: 0;
		margin-left: auto;
		font-size: 10px;
		font-weight: 700;
		opacity: 0.9;
		white-space: nowrap;
	}

	.calendar-hint {
		font-size: 13px;
		color: var(--color-muted);
		margin: 12px 0 0;
	}

	@media (max-width: 600px) {
		.day-cell {
			min-height: 64px;
			padding: 4px;
		}

		.chip-time {
			display: none;
		}
	}
</style>
