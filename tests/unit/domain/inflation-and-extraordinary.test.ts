import { describe, expect, it } from 'vitest';
import {
	AporteExtraordinario,
	CalendarDate,
	InflationRate,
	InvestmentScenario,
	Money,
	simular
} from '$domain';

describe('Inflación (Fórmula de Fisher) y Aportes Extraordinarios', () => {
	describe('InflationRate Value Object', () => {
		it('creates valid InflationRate and rejects invalid ranges', () => {
			const zero = InflationRate.zero();
			expect(zero.percentage).toBe(0);
			expect(zero.decimal).toBe(0);

			const valid = InflationRate.fromPercentage(4.5);
			expect(valid.percentage).toBe(4.5);
			expect(valid.decimal).toBe(0.045);

			expect(() => InflationRate.fromPercentage(-1)).toThrow(/entre 0 y 100/);
			expect(() => InflationRate.fromPercentage(101)).toThrow(/entre 0 y 100/);
			expect(() => InflationRate.fromPercentage(NaN)).toThrow(/numérico/);
		});

		it('calculates real rate using Fisher equation: (1 + r_nom) = (1 + r_real) * (1 + i)', () => {
			const inflacion4 = InflationRate.fromPercentage(4);

			// Fisher: (1 + 0.10) / (1 + 0.04) - 1 = 1.10 / 1.04 - 1 = 0.0576923... -> 5.77%
			const rReal10 = inflacion4.calculateRealRate(10);
			expect(rReal10).toBe(5.77);

			// Fisher: (1 + 0.12) / (1 + 0.03) - 1 = 1.12 / 1.03 - 1 = 0.087378... -> 8.74%
			const inflacion3 = InflationRate.fromPercentage(3);
			const rReal12 = inflacion3.calculateRealRate(12);
			expect(rReal12).toBe(8.74);

			// When inflation is 0, real rate equals nominal rate
			const inflacion0 = InflationRate.zero();
			expect(inflacion0.calculateRealRate(15)).toBe(15);

			// When nominal rate equals inflation, real rate is 0%
			const inflacion5 = InflationRate.fromPercentage(5);
			expect(inflacion5.calculateRealRate(5)).toBe(0);

			// When nominal rate is below inflation, real rate is negative
			expect(inflacion5.calculateRealRate(2)).toBe(-2.86);
		});

		it('calculates purchasing power deflated by inflation over exact elapsed days', () => {
			const inflacion10 = InflationRate.fromPercentage(10);

			// 1000 RD$ after 365 days with 10% inflation -> 1000 / (1.10)^1 = 909.09 RD$
			const pp = inflacion10.calculatePurchasingPower(1000, 365);
			expect(pp.amount).toBe(909.09);

			// Zero inflation preserves exact nominal purchasing power
			const inflacion0 = InflationRate.zero();
			expect(inflacion0.calculatePurchasingPower(1000, 365).amount).toBe(1000);

			// Zero or negative days preserves nominal balance
			expect(inflacion10.calculatePurchasingPower(1000, 0).amount).toBe(1000);
		});
	});

	describe('AporteExtraordinario Entity', () => {
		it('creates valid scheduled deposit with typed Money and CalendarDate', () => {
			const aporte = AporteExtraordinario.create(
				'extra-1',
				50000,
				'2026-12-15',
				'Regalía Pascual (Doble Sueldo RD)'
			);

			expect(aporte.id).toBe('extra-1');
			expect(aporte.monto.amount).toBe(50000);
			expect(aporte.fecha.iso).toBe('2026-12-15');
			expect(aporte.descripcion).toBe('Regalía Pascual (Doble Sueldo RD)');
		});

		it('rejects invalid aporte with empty id or negative amount', () => {
			expect(() => AporteExtraordinario.create('', 1000, '2026-12-15')).toThrow(/identificador/);
			expect(() => AporteExtraordinario.create('extra-bad', -500, '2026-12-15')).toThrow(/negativo/);
		});
	});

	describe('simular with Fisher Inflation & Scheduled Contributions', () => {
		const esc = InvestmentScenario.create('inv-1', 'Depósito a Plazo', 12.0, 'emerald');

		it('incorporates scheduled extraordinary contributions into the matching cycle', () => {
			const extra = AporteExtraordinario.create(
				'regalia',
				25000,
				'2026-06-01',
				'Bono Vacacional'
			);

			const resultado = simular({
				capitalInicial: 100000,
				aporteMensual: 5000,
				fechaInicio: '2026-04-17',
				fechaFin: '2026-08-16',
				diaCorte: 16,
				escenarios: [esc],
				aportesExtraordinarios: [extra]
			});

			expect(resultado.totalExtraordinario?.amount).toBe(25000);

			// Period 1: 2026-04-17 to 2026-05-16 -> Extra 2026-06-01 does NOT fall here
			const p1 = resultado.periodos[0];
			expect(p1?.resultadosPorEscenario[0]?.aporteExtraordinario?.amount).toBe(0);

			// Period 2: 2026-05-16 to 2026-06-16 -> Extra 2026-06-01 falls here!
			const p2 = resultado.periodos[1];
			expect(p2?.resultadosPorEscenario[0]?.aporteExtraordinario?.amount).toBe(25000);

			// Period 3: 2026-06-16 to 2026-07-16 -> Extra is 0
			const p3 = resultado.periodos[2];
			expect(p3?.resultadosPorEscenario[0]?.aporteExtraordinario?.amount).toBe(0);

			// Total Invertido = 100000 + (4 * 5000) + 25000 = 145000
			expect(resultado.totalInvertido.amount).toBe(145000);
		});

		it('computes Fisher real rate and purchasing power alongside nominal balance', () => {
			const resultado = simular({
				capitalInicial: 100000,
				aporteMensual: 0,
				fechaInicio: '2026-01-01',
				fechaFin: '2027-01-01',
				diaCorte: 1,
				escenarios: [esc],
				tasaInflacion: 4.0
			});

			const summary = resultado.resumenPorEscenario[0];
			expect(summary).toBeDefined();
			if (summary) {
				// Fisher real rate: (1 + 0.12) / (1 + 0.04) - 1 = 7.69%
				expect(summary.tasaRealAnual).toBe(7.69);

				// Real purchasing power must be less than nominal balance
				expect(summary.balanceReal?.amount).toBeLessThan(summary.balanceFinal.amount);
				expect(summary.balanceReal?.amount).toBeGreaterThan(0);
			}
		});
	});
});
