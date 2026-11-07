import { describe, expect, it } from 'vitest';
import {
	CalendarDate,
	CutoffDay,
	InterestRate,
	InvalidCalendarDateError,
	InvalidCutoffDayError,
	InvalidInterestRateError,
	InvalidMoneyError,
	Money
} from '$domain';

describe('Value Objects Unit Tests', () => {
	describe('Money', () => {
		it('creates Money from number and converts correctly to cents and amount', () => {
			const m = Money.fromNumber(185.5);
			expect(m.amount).toBe(185.5);
			expect(m.cents).toBe(18550);
		});

		it('creates Money from integer cents', () => {
			const m = Money.fromCents(18501);
			expect(m.amount).toBe(185.01);
			expect(m.cents).toBe(18501);
		});

		it('adds and subtracts money preserving precision', () => {
			const m1 = Money.fromNumber(100.25);
			const m2 = Money.fromNumber(50.75);
			const sum = m1.add(m2);
			expect(sum.amount).toBe(151.0);

			const diff = m1.subtract(m2);
			expect(diff.amount).toBe(49.5);
		});

		it('throws InvalidMoneyError on negative creation or subtraction resulting in negative', () => {
			expect(() => Money.fromNumber(-10)).toThrow(InvalidMoneyError);
			expect(() => Money.fromCents(-1)).toThrow(InvalidMoneyError);

			const m1 = Money.fromNumber(10);
			const m2 = Money.fromNumber(20);
			expect(() => m1.subtract(m2)).toThrow(InvalidMoneyError);
		});

		it('multiplies correctly with factor', () => {
			const m = Money.fromNumber(100);
			const mult = m.multiply(0.9);
			expect(mult.amount).toBe(90.0);
		});

		it('compares amounts properly', () => {
			const m1 = Money.fromNumber(100);
			const m2 = Money.fromNumber(200);
			expect(m1.isLessThan(m2)).toBe(true);
			expect(m2.isGreaterThan(m1)).toBe(true);
			expect(m1.equals(Money.fromNumber(100))).toBe(true);
		});
	});

	describe('InterestRate', () => {
		it('creates valid rates and computes monthly and daily rate', () => {
			const rate = InterestRate.fromPercentage(12);
			expect(rate.percentage).toBe(12);
			expect(rate.decimal).toBe(0.12);
			expect(rate.monthlyRate).toBeCloseTo(0.01, 6);
			expect(rate.dailyRate365).toBeCloseTo(0.12 / 365, 8);
		});

		it('throws InvalidInterestRateError for out of range percentages', () => {
			expect(() => InterestRate.fromPercentage(-1)).toThrow(InvalidInterestRateError);
			expect(() => InterestRate.fromPercentage(1001)).toThrow(InvalidInterestRateError);
			expect(() => InterestRate.fromPercentage(NaN)).toThrow(InvalidInterestRateError);
		});
	});

	describe('CalendarDate', () => {
		it('parses valid ISO string and exposes parts', () => {
			const date = CalendarDate.fromISO('2026-04-17');
			expect(date.year).toBe(2026);
			expect(date.month).toBe(4);
			expect(date.day).toBe(17);
			expect(date.iso).toBe('2026-04-17');
		});

		it('detects leap years correctly', () => {
			expect(CalendarDate.isLeapYear(2024)).toBe(true);
			expect(CalendarDate.isLeapYear(2026)).toBe(false);
			expect(CalendarDate.isLeapYear(2000)).toBe(true);
			expect(CalendarDate.isLeapYear(1900)).toBe(false);
		});

		it('calculates days in month correctly for leap and non-leap years', () => {
			expect(CalendarDate.getDaysInMonth(2024, 2)).toBe(29);
			expect(CalendarDate.getDaysInMonth(2026, 2)).toBe(28);
			expect(CalendarDate.getDaysInMonth(2026, 4)).toBe(30);
			expect(CalendarDate.getDaysInMonth(2026, 5)).toBe(31);
		});

		it('calculates days between dates accurately', () => {
			const d1 = CalendarDate.fromISO('2026-04-17');
			const d2 = CalendarDate.fromISO('2026-05-16');
			expect(d1.daysBetween(d2)).toBe(29);

			const leap1 = CalendarDate.fromISO('2024-02-01');
			const leap2 = CalendarDate.fromISO('2024-03-01');
			expect(leap1.daysBetween(leap2)).toBe(29);
		});

		it('formats short month and year representation', () => {
			const d = CalendarDate.fromISO('2026-05-16');
			expect(d.formatShortMonthYear()).toBe('MAY 26');
		});

		it('throws InvalidCalendarDateError for invalid dates or formats', () => {
			expect(() => CalendarDate.fromISO('invalid')).toThrow(InvalidCalendarDateError);
			expect(() => CalendarDate.fromISO('2026-02-30')).toThrow(InvalidCalendarDateError);
			expect(() => CalendarDate.fromISO('2026-13-01')).toThrow(InvalidCalendarDateError);
		});
	});

	describe('CutoffDay', () => {
		it('creates CutoffDay and validates range 1 to 31', () => {
			const cut = CutoffDay.fromNumber(16);
			expect(cut.value).toBe(16);

			expect(() => CutoffDay.fromNumber(0)).toThrow(InvalidCutoffDayError);
			expect(() => CutoffDay.fromNumber(32)).toThrow(InvalidCutoffDayError);
		});

		it('clamps cutoff day for months with fewer days', () => {
			const cut31 = CutoffDay.fromNumber(31);
			expect(cut31.clampedFor(2026, 2)).toBe(28); // Feb non-leap
			expect(cut31.clampedFor(2024, 2)).toBe(29); // Feb leap
			expect(cut31.clampedFor(2026, 4)).toBe(30); // Apr
			expect(cut31.clampedFor(2026, 5)).toBe(31); // May
		});

		it('calculates next cutoff correctly', () => {
			const cut16 = CutoffDay.fromNumber(16);

			// Start date: 2026-04-17 (day 17 >= 16) -> next is 2026-05-16
			const d1 = CalendarDate.fromISO('2026-04-17');
			const next1 = cut16.nextCutoffAfter(d1);
			expect(next1.iso).toBe('2026-05-16');

			// From 2026-05-16 (day 16 >= 16) -> next is 2026-06-16
			const next2 = cut16.nextCutoffAfter(next1);
			expect(next2.iso).toBe('2026-06-16');

			// If current day < cutoff: 2026-04-10 -> next is 2026-04-16
			const dBefore = CalendarDate.fromISO('2026-04-10');
			const nextBefore = cut16.nextCutoffAfter(dBefore);
			expect(nextBefore.iso).toBe('2026-04-16');
		});
	});
});
