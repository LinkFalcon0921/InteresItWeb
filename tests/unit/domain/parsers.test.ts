import { describe, expect, it } from 'vitest';
import { FinancialInputParser, SettingsParser } from '$domain';

describe('Domain Parsers Unit Tests', () => {
	describe('FinancialInputParser', () => {
		it('parses valid money from string and number', () => {
			const resNum = FinancialInputParser.parseMoney(150.75, 'monto');
			expect(resNum.ok).toBe(true);
			if (resNum.ok) {
				expect(resNum.value.amount).toBe(150.75);
			}

			const resStr = FinancialInputParser.parseMoney(' 1,250.50 ', 'monto');
			expect(resStr.ok).toBe(true);
			if (resStr.ok) {
				expect(resStr.value.amount).toBe(1250.5);
			}
		});

		it('handles default values and returns error for invalid money', () => {
			const resEmptyWithDefault = FinancialInputParser.parseMoney('', 'monto', 185);
			expect(resEmptyWithDefault.ok).toBe(true);
			if (resEmptyWithDefault.ok) {
				expect(resEmptyWithDefault.value.amount).toBe(185);
			}

			const resNegative = FinancialInputParser.parseMoney(-5, 'monto');
			expect(resNegative.ok).toBe(false);

			const resNaN = FinancialInputParser.parseMoney('abc', 'monto');
			expect(resNaN.ok).toBe(false);
		});

		it('parses interest rate properly', () => {
			const res = FinancialInputParser.parseInterestRate(' 10.5% ', 'tasa');
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.value.percentage).toBe(10.5);
			}

			const resInvalid = FinancialInputParser.parseInterestRate('9999', 'tasa');
			expect(resInvalid.ok).toBe(false);
		});

		it('parses calendar date safely', () => {
			const res = FinancialInputParser.parseCalendarDate('2026-04-17', 'fecha');
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.value.iso).toBe('2026-04-17');
			}

			// Date instance preserves local calendar parts
			const dateObj = new Date(2026, 3, 17); // April 17, 2026
			const resDate = FinancialInputParser.parseCalendarDate(dateObj, 'fecha');
			expect(resDate.ok).toBe(true);
			if (resDate.ok) {
				expect(resDate.value.iso).toBe('2026-04-17');
			}

			const resInvalid = FinancialInputParser.parseCalendarDate('31-02-2026', 'fecha');
			expect(resInvalid.ok).toBe(false);
		});

		it('parses cutoff day safely', () => {
			const res = FinancialInputParser.parseCutoffDay('16', 'corte');
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.value.value).toBe(16);
			}

			const resOutOfRange = FinancialInputParser.parseCutoffDay('45', 'corte');
			expect(resOutOfRange.ok).toBe(false);
		});

		it('parses boolean with truthy and falsy strings', () => {
			const resTrue = FinancialInputParser.parseBoolean('true');
			expect(resTrue.ok).toBe(true);
			if (resTrue.ok) expect(resTrue.value).toBe(true);

			const resFalse = FinancialInputParser.parseBoolean('false');
			expect(resFalse.ok).toBe(true);
			if (resFalse.ok) expect(resFalse.value).toBe(false);

			const resDefault = FinancialInputParser.parseBoolean(null, 'bool', true);
			expect(resDefault.ok).toBe(true);
			if (resDefault.ok) expect(resDefault.value).toBe(true);
		});
	});

	describe('SettingsParser', () => {
		it('parses complete legacy IndexedDB settings document', () => {
			const legacyDoc = {
				id: 'current',
				montoInicial: '185',
				aporteMensual: '0',
				inversiones: [
					{ id: '1', nombre: 'Conservador', tasa: 0.1, color: 'blue' },
					{ id: '2', nombre: 'Dinámico', tasa: 3.0, color: 'emerald' }
				],
				fechaInicio: '2026-04-17',
				fechaFin: '2026-11-16',
				diaCorte: '16',
				omitirPrimerCorte: false,
				aplicarImpuesto: false,
				isDarkMode: true
			};

			const parsed = SettingsParser.parseSettings(legacyDoc);
			expect(parsed.ok).toBe(true);
			if (parsed.ok) {
				expect(parsed.value.montoInicial.amount).toBe(185);
				expect(parsed.value.inversiones).toHaveLength(2);
				expect(parsed.value.fechaInicio.iso).toBe('2026-04-17');
				expect(parsed.value.diaCorte.value).toBe(16);
				expect(parsed.value.isDarkMode).toBe(true);
			}
		});

		it('handles empty or partial settings by providing defaults', () => {
			const parsed = SettingsParser.parseSettings({});
			expect(parsed.ok).toBe(true);
			if (parsed.ok) {
				expect(parsed.value.montoInicial.amount).toBe(185);
				expect(parsed.value.inversiones).toHaveLength(2);
			}
		});

		it('returns error when payload is not an object', () => {
			const parsed = SettingsParser.parseSettings('not an object');
			expect(parsed.ok).toBe(false);
		});
	});
});
