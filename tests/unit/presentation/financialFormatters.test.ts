import { describe, expect, it } from 'vitest';
import {
	formatCurrency,
	formatDays,
	formatDifference,
	formatPercentage
} from '$presentation/formatters/financialFormatters';

describe('financialFormatters', () => {
	it('formats numbers as currency in DOP format without DOP prefix', () => {
		expect(formatCurrency(0)).toContain('0.00');
		expect(formatCurrency(185)).toContain('185.00');
		expect(formatCurrency(12500.5)).toContain('12,500.50');
		expect(formatCurrency(NaN)).toBe('$0.00');
	});

	it('formats percentage with 2 decimals and percent symbol', () => {
		expect(formatPercentage(10)).toBe('10.00%');
		expect(formatPercentage(12.5)).toBe('12.50%');
		expect(formatPercentage(NaN)).toBe('0.00%');
	});

	it('formats days with suffix d', () => {
		expect(formatDays(31)).toBe('31 d');
		expect(formatDays(28.4)).toBe('28 d');
		expect(formatDays(-5)).toBe('0 d');
	});

	it('formats difference with explicit plus sign for positive and minus for negative', () => {
		expect(formatDifference(0)).toBe('$0.00');
		expect(formatDifference(12.5)).toContain('+');
		expect(formatDifference(-8.2)).toContain('-');
	});
});
