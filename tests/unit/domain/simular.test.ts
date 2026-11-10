import { describe, expect, it } from 'vitest';
import {
	CalendarDate,
	CutoffDay,
	simular,
	InvestmentScenario,
	InvalidDateRangeError,
	InvalidScenarioError,
	Money,
	ScenarioRole
} from '$domain';

describe('Financial Core simular Unit Tests', () => {
	const escA = InvestmentScenario.create('esc-a', 'Estrategia Conservadora', 0.1, 'blue');
	const escB = InvestmentScenario.create('esc-b', 'Estrategia Dinámica', 3.0, 'emerald');

	describe('ADR-004 Official Baseline Reference Characterization', () => {
		it('reproduces exact baseline: Capital 185, 0.1% vs 3.0%, 2026-04-17 to 2026-11-16, corte 16', () => {
			const resultado = simular({
				capitalInicial: 185,
				aporteMensual: 0,
				fechaInicio: '2026-04-17',
				fechaFin: '2026-11-16',
				diaCorte: 16,
				escenarios: [escA, escB],
				omitirPrimerCorte: false,
				aplicarImpuestoRD: false
			});

			expect(resultado.periodos).toHaveLength(7);

			// Período 1: 17 abr -> 16 may 2026 (29 días)
			const p1 = resultado.periodos[0];
			expect(p1?.periodoIndex).toBe(1);
			expect(p1?.diasPeriodo).toBe(29);
			expect(p1?.etiquetaMes).toBe('MAY 26');

			const p1ResA = p1?.resultadosPorEscenario.find((r) => r.escenarioId === 'esc-a');
			const p1ResB = p1?.resultadosPorEscenario.find((r) => r.escenarioId === 'esc-b');

			expect(p1ResA?.balanceFinal.amount).toBe(185.01);
			expect(p1ResB?.balanceFinal.amount).toBe(185.44);

			// Saldo final al 16 nov 2026: 185.11 y 188.26
			const resumenA = resultado.resumenPorEscenario.find((r) => r.escenarioId === 'esc-a');
			const resumenB = resultado.resumenPorEscenario.find((r) => r.escenarioId === 'esc-b');

			expect(resumenA?.balanceFinal.amount).toBe(185.11);
			expect(resumenB?.balanceFinal.amount).toBe(188.26);

			// Ventaja líder: +3.15
			expect(resultado.escenarioLiderId).toBe('esc-b');
			expect(resultado.ventajaLider.amount).toBe(3.15);
			expect(resumenB?.rol).toBe(ScenarioRole.Leader);
			expect(resumenA?.rol).toBe(ScenarioRole.Challenger);
		});
	});

	describe('Tax Retention (10% Ley RD)', () => {
		it('deducts 10% tax on gross interest per cycle', () => {
			const resSinImpuesto = simular({
				capitalInicial: 100000,
				aporteMensual: 0,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-02-01',
				diaCorte: 1,
				escenarios: [InvestmentScenario.create('inv-1', 'Tasa 12%', 12, 'emerald')],
				aplicarImpuestoRD: false
			});

			const resConImpuesto = simular({
				capitalInicial: 100000,
				aporteMensual: 0,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-02-01',
				diaCorte: 1,
				escenarios: [InvestmentScenario.create('inv-1', 'Tasa 12%', 12, 'emerald')],
				aplicarImpuestoRD: true
			});

			const intSin = resSinImpuesto.periodos[0]?.resultadosPorEscenario[0]?.interesNeto.amount ?? 0;
			const intCon = resConImpuesto.periodos[0]?.resultadosPorEscenario[0]?.interesNeto.amount ?? 0;

			expect(intSin).toBe(1019.18);
			expect(intCon).toBe(917.26);
		});
	});

	describe('Omitir Primer Corte', () => {
		it('skips interest in first partial period if dias < diasEnMes and omitirPrimerCorte is true', () => {
			const resultado = simular({
				capitalInicial: 10000,
				aporteMensual: 0,
				fechaInicio: '2026-04-20',
				fechaFin: '2026-06-15',
				diaCorte: 15,
				escenarios: [escB],
				omitirPrimerCorte: true
			});

			// Primer corte: del 20 abr al 15 may (25 días < 30 días de abril) -> Debe omitirse
			const p1 = resultado.periodos[0];
			expect(p1?.resultadosPorEscenario[0]?.isSkipped).toBe(true);
			expect(p1?.resultadosPorEscenario[0]?.interesNeto.amount).toBe(0);

			// Segundo corte: del 15 may al 15 jun -> Computa normalmente
			const p2 = resultado.periodos[1];
			expect(p2?.resultadosPorEscenario[0]?.isSkipped).toBe(false);
			expect(p2?.resultadosPorEscenario[0]?.interesNeto.amount).toBe(25.48);
		});
	});

	describe('Monthly Contributions (PMT)', () => {
		it('correctly adds recurrent contributions to balances and computes total invested', () => {
			const resultado = simular({
				capitalInicial: 1000,
				aporteMensual: 200,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-04-01',
				diaCorte: 1,
				escenarios: [escB]
			});

			expect(resultado.periodos).toHaveLength(3);
			// 3 aportes de 200 = 600 total aportado
			expect(resultado.totalAportado.amount).toBe(600);
			expect(resultado.totalInvertido.amount).toBe(1600);
			expect(resultado.resumenPorEscenario[0]?.balanceFinal.amount).toBeGreaterThan(1600);
		});
	});

	describe('Cutoff Clamping and Leap Year', () => {
		it('clamps day 31 to 28 in Feb 2026 and 29 in Feb 2024', () => {
			const res2026 = simular({
				capitalInicial: 1000,
				aporteMensual: 0,
				fechaInicio: '2026-01-31',
				fechaFin: '2026-03-31',
				diaCorte: 31,
				escenarios: [escB]
			});

			// Período 1: 31 ene a 28 feb
			expect(res2026.periodos[0]?.fechaCorte.iso).toBe('2026-02-28');
			// Período 2: 28 feb a 31 mar
			expect(res2026.periodos[1]?.fechaCorte.iso).toBe('2026-03-31');

			const res2024 = simular({
				capitalInicial: 1000,
				aporteMensual: 0,
				fechaInicio: '2024-01-31',
				fechaFin: '2024-03-31',
				diaCorte: 31,
				escenarios: [escB]
			});

			// Período 1 en año bisiesto 2024: 31 ene a 29 feb
			expect(res2024.periodos[0]?.fechaCorte.iso).toBe('2024-02-29');
		});
	});

	describe('Multi-scenario Support', () => {
		it('simulates up to 20 scenarios concurrently with independent balances', () => {
			const escenarios = Array.from({ length: 20 }, (_, i) =>
				InvestmentScenario.create(`inv-${i + 1}`, `Fondo ${i + 1}`, 5 + i * 0.5, 'emerald')
			);

			const resultado = simular({
				capitalInicial: 5000,
				aporteMensual: 100,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-07-01',
				diaCorte: 1,
				escenarios
			});

			expect(resultado.resumenPorEscenario).toHaveLength(20);
			// El escenario con mayor tasa (inv-20 con 14.5%) debe ser el líder
			expect(resultado.escenarioLiderId).toBe('inv-20');
			expect(resultado.resumenPorEscenario[19]?.rol).toBe(ScenarioRole.Leader);
		});
	});

	describe('Validation & Boundary Cases', () => {
		it('throws InvalidDateRangeError if fechaInicio >= fechaFin', () => {
			expect(() =>
				simular({
					capitalInicial: 100,
					aporteMensual: 0,
					fechaInicio: '2026-05-01',
					fechaFin: '2026-05-01',
					diaCorte: 1,
					escenarios: [escA]
				})
			).toThrow(InvalidDateRangeError);

			expect(() =>
				simular({
					capitalInicial: 100,
					aporteMensual: 0,
					fechaInicio: '2026-06-01',
					fechaFin: '2026-05-01',
					diaCorte: 1,
					escenarios: [escA]
				})
			).toThrow(InvalidDateRangeError);
		});

		it('throws InvalidScenarioError if scenarios array is empty', () => {
			expect(() =>
				simular({
					capitalInicial: 100,
					aporteMensual: 0,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-05-01',
					diaCorte: 1,
					escenarios: []
				})
			).toThrow(InvalidScenarioError);
		});

		it('throws InvalidScenarioError if more than 200 scenarios are provided', () => {
			const scenarios201 = Array.from({ length: 201 }, (_, i) =>
				InvestmentScenario.create(`inv-${i + 1}`, `Fondo ${i + 1}`, 5, 'emerald')
			);
			expect(() =>
				simular({
					capitalInicial: 100,
					aporteMensual: 0,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-05-01',
					diaCorte: 1,
					escenarios: scenarios201
				})
			).toThrow(InvalidScenarioError);
		});

		it('supports simulating 100+ concurrent scenarios correctly without errors', () => {
			const scenarios105 = Array.from({ length: 105 }, (_, i) =>
				InvestmentScenario.create(`inv-${i + 1}`, `Fondo ${i + 1}`, 5 + i * 0.1, 'emerald')
			);
			const res = simular({
				capitalInicial: 1000,
				aporteMensual: 100,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-06-01',
				diaCorte: 1,
				escenarios: scenarios105
			});
			expect(res.resumenPorEscenario).toHaveLength(105);
			expect(res.periodos[0]?.resultadosPorEscenario).toHaveLength(105);
			expect(res.escenarioLiderId).toBe('inv-105');
		});

		it('handles ultra-short leap year period: 2024-02-28 to 2024-02-29 with corte 29', () => {
			const res = simular({
				capitalInicial: 1000,
				aporteMensual: 0,
				fechaInicio: '2024-02-28',
				fechaFin: '2024-02-29',
				diaCorte: 29,
				escenarios: [escB],
				omitirPrimerCorte: false
			});

			expect(res.periodos).toHaveLength(1);
			expect(res.periodos[0]?.diasPeriodo).toBe(1);
			expect(res.periodos[0]?.fechaCorte.iso).toBe('2024-02-29');
			expect(res.periodos[0]?.resultadosPorEscenario[0]?.interesNeto.amount).toBeGreaterThan(0);
		});

		it('handles ties between scenarios with identical rates gracefully', () => {
			const escTie1 = InvestmentScenario.create('tie-1', 'Plan Alpha', 5.0, 'blue');
			const escTie2 = InvestmentScenario.create('tie-2', 'Plan Beta', 5.0, 'emerald');

			const res = simular({
				capitalInicial: 1000,
				aporteMensual: 0,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-03-01',
				diaCorte: 1,
				escenarios: [escTie1, escTie2]
			});

			expect(res.ventajaLider.amount).toBe(0);
			expect(res.escenarioLiderId).toBe('');
			expect(res.resumenPorEscenario[0]?.rol).toBe(ScenarioRole.Neutral);
			expect(res.resumenPorEscenario[1]?.rol).toBe(ScenarioRole.Neutral);
		});
	});
});
