import { InvalidCutoffDayError } from '../errors/DomainErrors';
import { CalendarDate } from './CalendarDate';

export class CutoffDay {
	private readonly _day: number;

	private constructor(day: number) {
		this._day = day;
	}

	public static fromNumber(day: number): CutoffDay {
		if (typeof day !== 'number' || !Number.isFinite(day) || !Number.isInteger(day)) {
			throw new InvalidCutoffDayError('El día de corte debe ser un número entero.');
		}
		if (day < 1 || day > 31) {
			throw new InvalidCutoffDayError(`El día de corte debe estar entre 1 y 31 (recibido: ${day}).`);
		}
		return new CutoffDay(day);
	}

	public get value(): number {
		return this._day;
	}

	public clampedFor(year: number, month: number): number {
		const maxDays = CalendarDate.getDaysInMonth(year, month);
		return Math.min(this._day, maxDays);
	}

	public dateFor(year: number, month: number): CalendarDate {
		const effectiveDay = this.clampedFor(year, month);
		return CalendarDate.fromParts(year, month, effectiveDay);
	}

	public nextCutoffAfter(current: CalendarDate): CalendarDate {
		const currentClamped = this.clampedFor(current.year, current.month);
		if (current.day < currentClamped) {
			return CalendarDate.fromParts(current.year, current.month, currentClamped);
		}

		let nextYear = current.year;
		let nextMonth = current.month + 1;
		if (nextMonth > 12) {
			nextYear += 1;
			nextMonth = 1;
		}

		const nextClamped = this.clampedFor(nextYear, nextMonth);
		return CalendarDate.fromParts(nextYear, nextMonth, nextClamped);
	}

	public equals(other: CutoffDay): boolean {
		return this._day === other._day;
	}
}
