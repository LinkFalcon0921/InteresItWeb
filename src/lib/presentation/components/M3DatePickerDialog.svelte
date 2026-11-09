<script lang="ts">
	interface Props {
		isOpen: boolean;
		value: string; // Formato YYYY-MM-DD
		title?: string;
		onSelect: (dateStr: string) => void;
		onClose: () => void;
	}

	let { isOpen, value, title = 'Seleccionar fecha', onSelect, onClose }: Props = $props();

	const MONTH_NAMES = [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	];
	const WEEKDAY_NAMES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

	let selectedDate = $state<Date>(new Date());
	let viewingYear = $state<number>(new Date().getFullYear());
	let viewingMonth = $state<number>(new Date().getMonth());

	$effect(() => {
		if (isOpen) {
			const parts = (value || '').split('-').map(Number);
			const year = parts[0];
			const month = parts[1];
			const day = parts[2];
			if (year && month && day && !Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
				selectedDate = new Date(year, month - 1, day);
				viewingYear = year;
				viewingMonth = month - 1;
			} else {
				const now = new Date();
				selectedDate = now;
				viewingYear = now.getFullYear();
				viewingMonth = now.getMonth();
			}
		}
	});

	const formattedHeaderDate = $derived.by(() => {
		const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
		const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
		const dow = days[selectedDate.getDay()] ?? '';
		const d = selectedDate.getDate();
		const m = months[selectedDate.getMonth()] ?? '';
		const y = selectedDate.getFullYear();
		return `${dow}, ${d} ${m} ${y}`;
	});

	const calendarGrid = $derived.by(() => {
		const firstDayIndex = new Date(viewingYear, viewingMonth, 1).getDay();
		const daysInCurrentMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
		const daysInPrevMonth = new Date(viewingYear, viewingMonth, 0).getDate();

		interface DayCell {
			day: number;
			isCurrentMonth: boolean;
			date: Date;
			isToday: boolean;
			isSelected: boolean;
		}

		const cells: DayCell[] = [];
		const today = new Date();
		const isSameDay = (d1: Date, d2: Date) =>
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();

		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const dayNum = daysInPrevMonth - i;
			const cellDate = new Date(viewingYear, viewingMonth - 1, dayNum);
			cells.push({
				day: dayNum,
				isCurrentMonth: false,
				date: cellDate,
				isToday: isSameDay(cellDate, today),
				isSelected: isSameDay(cellDate, selectedDate)
			});
		}

		for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
			const cellDate = new Date(viewingYear, viewingMonth, dayNum);
			cells.push({
				day: dayNum,
				isCurrentMonth: true,
				date: cellDate,
				isToday: isSameDay(cellDate, today),
				isSelected: isSameDay(cellDate, selectedDate)
			});
		}

		const remainder = 42 - cells.length;
		for (let dayNum = 1; dayNum <= remainder; dayNum++) {
			const cellDate = new Date(viewingYear, viewingMonth + 1, dayNum);
			cells.push({
				day: dayNum,
				isCurrentMonth: false,
				date: cellDate,
				isToday: isSameDay(cellDate, today),
				isSelected: isSameDay(cellDate, selectedDate)
			});
		}

		return cells;
	});

	function prevMonth(): void {
		if (viewingMonth === 0) {
			viewingMonth = 11;
			viewingYear -= 1;
		} else {
			viewingMonth -= 1;
		}
	}

	function nextMonth(): void {
		if (viewingMonth === 11) {
			viewingMonth = 0;
			viewingYear += 1;
		} else {
			viewingMonth += 1;
		}
	}

	function handleDayClick(date: Date): void {
		selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		viewingYear = date.getFullYear();
		viewingMonth = date.getMonth();
	}

	function handleConfirm(): void {
		const y = selectedDate.getFullYear();
		const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
		const d = String(selectedDate.getDate()).padStart(2, '0');
		onSelect(`${y}-${m}-${d}`);
		onClose();
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onClose();
		} else if (event.key === 'Enter') {
			handleConfirm();
		}
	}
</script>

{#if isOpen}
	<div
		class="m3-dialog-scrim"
		role="presentation"
		onclick={onClose}
		onkeydown={handleKeyDown}
	>
		<div
			class="m3-date-picker-card"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleKeyDown}
		>
			<!-- M3 Header Section -->
			<div class="m3-header">
				<span class="m3-header-eyebrow">SELECT DATE</span>
				<div class="m3-header-row">
					<h2 class="m3-header-date">{formattedHeaderDate}</h2>
					<button
						type="button"
						class="m3-icon-btn m3-edit-icon"
						aria-label="Seleccionar fecha actual"
						title="Ir a hoy"
						onclick={() => handleDayClick(new Date())}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M12 20h9"></path>
							<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
						</svg>
					</button>
				</div>
			</div>

			<!-- M3 Month Navigation -->
			<div class="m3-nav-bar">
				<span class="m3-nav-month-year">{MONTH_NAMES[viewingMonth]} {viewingYear}</span>
				<div class="m3-nav-arrows">
					<button type="button" class="m3-nav-arrow-btn" onclick={prevMonth} aria-label="Mes anterior">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
					</button>
					<button type="button" class="m3-nav-arrow-btn" onclick={nextMonth} aria-label="Mes siguiente">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
					</button>
				</div>
			</div>

			<!-- Weekday Labels -->
			<div class="m3-weekdays-row" aria-hidden="true">
				{#each WEEKDAY_NAMES as day}
					<span class="m3-weekday-label">{day}</span>
				{/each}
			</div>

			<!-- Days Grid -->
			<div class="m3-days-grid" role="grid" aria-label="Calendario del mes">
				{#each calendarGrid as cell}
					<button
						type="button"
						role="gridcell"
						class="m3-day-cell {cell.isCurrentMonth ? '' : 'm3-day--dimmed'} {cell.isToday ? 'm3-day--today' : ''} {cell.isSelected ? 'm3-day--selected' : ''}"
						aria-label="{cell.day} de {MONTH_NAMES[cell.date.getMonth()]} {cell.date.getFullYear()}"
						aria-selected={cell.isSelected}
						onclick={() => handleDayClick(cell.date)}
					>
						<span class="m3-day-num">{cell.day}</span>
					</button>
				{/each}
			</div>

			<!-- Action Buttons (Cancel / OK) -->
			<div class="m3-actions">
				<button type="button" class="m3-action-btn m3-action-btn--cancel" onclick={onClose}>Cancel</button>
				<button type="button" class="m3-action-btn m3-action-btn--confirm" onclick={handleConfirm}>OK</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.m3-dialog-scrim {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 16px;
		animation: m3-fade-in 0.2s cubic-bezier(0.2, 0, 0, 1);
	}
	.m3-date-picker-card {
		background: #ffffff;
		color: #1e293b;
		border-radius: 24px;
		box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
		width: 100%;
		max-width: 328px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: m3-scale-in 0.22s cubic-bezier(0.2, 0, 0, 1);
	}
	.m3-header { padding: 16px 24px 12px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
	.m3-header-eyebrow { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }
	.m3-header-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
	.m3-header-date { margin: 0; font-size: 1.625rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
	.m3-edit-icon {
		background: transparent; border: none; color: #64748b; width: 36px; height: 36px;
		border-radius: 50%; display: flex; align-items: center; justify-content: center;
		cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
	}
	.m3-edit-icon:hover { background: #e2e8f0; color: #0f172a; }
	.m3-edit-icon svg { width: 18px; height: 18px; }
	.m3-nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 4px; }
	.m3-nav-month-year { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
	.m3-nav-arrows { display: flex; gap: 4px; }
	.m3-nav-arrow-btn {
		background: transparent; border: none; width: 32px; height: 32px; border-radius: 50%;
		display: flex; align-items: center; justify-content: center; color: #475569;
		cursor: pointer; transition: background 0.15s ease;
	}
	.m3-nav-arrow-btn:hover { background: #f1f5f9; color: #0f172a; }
	.m3-nav-arrow-btn svg { width: 16px; height: 16px; }
	.m3-weekdays-row { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; padding: 8px 16px 4px; }
	.m3-weekday-label { font-size: 0.75rem; font-weight: 700; color: #64748b; }
	.m3-days-grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 4px 16px 12px; gap: 2px; }
	.m3-day-cell {
		aspect-ratio: 1; border: none; background: transparent; border-radius: 50%;
		display: flex; align-items: center; justify-content: center; font-family: inherit;
		font-size: 0.8125rem; font-weight: 600; color: #1e293b; cursor: pointer; transition: all 0.15s ease;
	}
	.m3-day-cell:hover:not(.m3-day--selected) { background: #f1f5f9; }
	.m3-day--dimmed { color: #cbd5e1; opacity: 0.45; }
	.m3-day--today:not(.m3-day--selected) { border: 1.5px solid #2563eb; color: #2563eb; font-weight: 700; }
	.m3-day--selected { background: #2563eb !important; color: #ffffff !important; font-weight: 700; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35); }
	.m3-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px 16px; border-top: 1px solid #f1f5f9; }
	.m3-action-btn {
		background: transparent; border: none; font-family: inherit; font-size: 0.875rem;
		font-weight: 700; padding: 8px 16px; border-radius: 9999px; cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.m3-action-btn--cancel, .m3-action-btn--confirm { color: #2563eb; }
	.m3-action-btn--cancel:hover, .m3-action-btn--confirm:hover { background: rgba(37, 99, 235, 0.08); }

	/* Dark mode styling */
	:global(html.dark) .m3-date-picker-card, :global(.dark) .m3-date-picker-card { background: #1e293b; color: #f1f5f9; box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1); }
	:global(html.dark) .m3-header, :global(.dark) .m3-header { background: #0f172a; border-bottom-color: #334155; }
	:global(html.dark) .m3-header-eyebrow, :global(.dark) .m3-header-eyebrow { color: #94a3b8; }
	:global(html.dark) .m3-header-date, :global(.dark) .m3-header-date { color: #f8fafc; }
	:global(html.dark) .m3-edit-icon, :global(.dark) .m3-edit-icon { color: #94a3b8; }
	:global(html.dark) .m3-edit-icon:hover, :global(.dark) .m3-edit-icon:hover { background: #334155; color: #f8fafc; }
	:global(html.dark) .m3-nav-month-year, :global(.dark) .m3-nav-month-year { color: #f8fafc; }
	:global(html.dark) .m3-nav-arrow-btn, :global(.dark) .m3-nav-arrow-btn { color: #cbd5e1; }
	:global(html.dark) .m3-nav-arrow-btn:hover, :global(.dark) .m3-nav-arrow-btn:hover { background: #334155; color: #ffffff; }
	:global(html.dark) .m3-weekday-label, :global(.dark) .m3-weekday-label { color: #94a3b8; }
	:global(html.dark) .m3-day-cell, :global(.dark) .m3-day-cell { color: #e2e8f0; }
	:global(html.dark) .m3-day-cell:hover:not(.m3-day--selected), :global(.dark) .m3-day-cell:hover:not(.m3-day--selected) { background: #334155; }
	:global(html.dark) .m3-day--dimmed, :global(.dark) .m3-day--dimmed { color: #475569; }
	:global(html.dark) .m3-day--today:not(.m3-day--selected), :global(.dark) .m3-day--today:not(.m3-day--selected) { border-color: #38bdf8; color: #38bdf8; }
	:global(html.dark) .m3-day--selected, :global(.dark) .m3-day--selected { background: #38bdf8 !important; color: #0f172a !important; box-shadow: 0 4px 10px rgba(56, 189, 248, 0.4); }
	:global(html.dark) .m3-actions, :global(.dark) .m3-actions { border-top-color: #334155; }
	:global(html.dark) .m3-action-btn--cancel, :global(.dark) .m3-action-btn--cancel,
	:global(html.dark) .m3-action-btn--confirm, :global(.dark) .m3-action-btn--confirm { color: #38bdf8; }
	:global(html.dark) .m3-action-btn--cancel:hover, :global(.dark) .m3-action-btn--cancel:hover,
	:global(html.dark) .m3-action-btn--confirm:hover, :global(.dark) .m3-action-btn--confirm:hover { background: rgba(56, 189, 248, 0.12); }

	@keyframes m3-fade-in { from { opacity: 0; } to { opacity: 1; } }
	@keyframes m3-scale-in { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
