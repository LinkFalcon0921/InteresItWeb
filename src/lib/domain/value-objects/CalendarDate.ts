import { InvalidCalendarDateError } from '../errors/DomainErrors';

export class CalendarDate {
	private readonly _year: number;
	private readonly _month: number; // 1 - 12
	private readonly _day: number; // 1 - 31
	private readonly _iso: string; // YYYY-MM-DD

	private constructor(year: number, month: number, day: number, iso: string) {
		this._year = year;
		this._month = month;
		this._day = day;
		this._iso = iso;
	}

	public static fromISO(iso: string): CalendarDate {
		if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
			throw new InvalidCalendarDateError(`Formato ISO inválido: "${iso}". Debe ser YYYY-MM-DD.`);
		}
		const parts = iso.split('-');
		const yearStr = parts[0];
		const monthStr = parts[1];
		const dayStr = parts[2];

		if (!yearStr || !monthStr || !dayStr) {
			throw new InvalidCalendarDateError(`Formato ISO incompleto: "${iso}".`);
		}

		const year = parseInt(yearStr, 10);
		const month = parseInt(monthStr, 10);
		const day = parseInt(dayStr, 10);

		if (month < 1 || month > 12) {
			throw new InvalidCalendarDateError(`Mes fuera de rango: ${month}. Debe estar entre 1 y 12.`);
		}

		const maxDays = CalendarDate.getDaysInMonth(year, month);
		if (day < 1 || day > maxDays) {
			throw new InvalidCalendarDateError(`Día fuera de rango para ${year}-${month}: ${day}. Máximo: ${maxDays}.`);
		}

		const paddedMonth = month.toString().padStart(2, '0');
		const paddedDay = day.toString().padStart(2, '0');
		const normalizedIso = `${year}-${paddedMonth}-${paddedDay}`;

		return new CalendarDate(year, month, day, normalizedIso);
	}

	public static fromParts(year: number, month: number, day: number): CalendarDate {
		const paddedMonth = month.toString().padStart(2, '0');
		const paddedDay = day.toString().padStart(2, '0');
		return CalendarDate.fromISO(`${year}-${paddedMonth}-${paddedDay}`);
	}

	public static isLeapYear(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	public static getDaysInMonth(year: number, month: number): number {
		if (month < 1 || month > 12) {
			throw new InvalidCalendarDateError(`Mes fuera de rango: ${month}. Debe estar entre 1 y 12.`);
		}
		switch (month) {
			case 2:
				return CalendarDate.isLeapYear(year) ? 29 : 28;
			case 4:
			case 6:
			case 9:
			case 11:
				return 30;
			default:
				return 31;
		}
	}

	public get year(): number {
		return this._year;
	}

	public get month(): number {
		return this._month;
	}

	public get day(): number {
		return this._day;
	}

	public get iso(): string {
		return this._iso;
	}

	public get utcTimestamp(): number {
		return Date.UTC(this._year, this._month - 1, this._day);
	}

	public isLeapYear(): boolean {
		return CalendarDate.isLeapYear(this._year);
	}

	public daysInMonth(): number {
		return CalendarDate.getDaysInMonth(this._year, this._month);
	}

	public daysBetween(other: CalendarDate): number {
		const diffMs = other.utcTimestamp - this.utcTimestamp;
		return Math.round(diffMs / 86400000);
	}

	public isBefore(other: CalendarDate): boolean {
		return this.utcTimestamp < other.utcTimestamp;
	}

	public isAfter(other: CalendarDate): boolean {
		return this.utcTimestamp > other.utcTimestamp;
	}

	public equals(other: CalendarDate): boolean {
		return this._iso === other._iso;
	}

	public formatShortMonthYear(locale = 'es-ES'): string {
		const monthNames: Record<number, string> = {
			1: 'ENE',
			2: 'FEB',
			3: 'MAR',
			4: 'ABR',
			5: 'MAY',
			6: 'JUN',
			7: 'JUL',
			8: 'AGO',
			9: 'SEP',
			10: 'OCT',
			11: 'NOV',
			12: 'DIC'
		};
		const shortMonth = monthNames[this._month] ?? 'MES';
		const shortYear = (this._year % 100).toString().padStart(2, '0');
		return `${shortMonth} ${shortYear}`;
	}
}
