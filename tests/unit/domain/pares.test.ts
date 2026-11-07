import { describe, expect, it } from 'vitest';
import {
	ComparisonAdvantage,
	generarPares,
	compararParesEscenarios,
	Money,
	ScenarioRole,
	type ScenarioSummary
} from '$domain';

describe('Pairwise Comparison (pares.ts) Unit Tests', () => {
	it('generates 0 pairs for 0 or 1 elements', () => {
		expect(generarPares([])).toEqual([]);
		expect(generarPares(['A'])).toEqual([]);
	});

	it('generates 1 pair for 2 elements: 2 * 1 / 2 = 1', () => {
		const result = generarPares(['A', 'B']);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual(['A', 'B']);
	});

	it('generates 3 pairs for 3 elements: 3 * 2 / 2 = 3', () => {
		const result = generarPares(['A', 'B', 'C']);
		expect(result).toHaveLength(3);
		expect(result).toEqual([
			['A', 'B'],
			['A', 'C'],
			['B', 'C']
		]);
	});

	it('generates 6 pairs for 4 elements: 4 * 3 / 2 = 6', () => {
		const result = generarPares([1, 2, 3, 4]);
		expect(result).toHaveLength(6);
	});

	it('generates 190 pairs for 20 elements: 20 * 19 / 2 = 190', () => {
		const arr = Array.from({ length: 20 }, (_, i) => i);
		const result = generarPares(arr);
		expect(result).toHaveLength(190);
	});

	it('compares scenario summaries and calculates differences accurately', () => {
		const sumA: ScenarioSummary = {
			escenarioId: 'esc-1',
			nombre: 'Fondo A',
			balanceFinal: Money.fromNumber(200.5),
			interesTotalNeto: Money.fromNumber(15.5),
			rendimientoNeto: Money.fromNumber(15.5),
			rol: ScenarioRole.Leader
		};

		const sumB: ScenarioSummary = {
			escenarioId: 'esc-2',
			nombre: 'Fondo B',
			balanceFinal: Money.fromNumber(185.0),
			interesTotalNeto: Money.fromNumber(0.0),
			rendimientoNeto: Money.fromNumber(0.0),
			rol: ScenarioRole.Challenger
		};

		const comparisons = compararParesEscenarios([sumA, sumB]);
		expect(comparisons).toHaveLength(1);

		const comp = comparisons[0];
		expect(comp).toBeDefined();
		expect(comp?.escenarioA.escenarioId).toBe('esc-1');
		expect(comp?.escenarioB.escenarioId).toBe('esc-2');
		expect(comp?.diferenciaBalance.amount).toBe(15.5);
		expect(comp?.favorecidoId).toBe('esc-1');
		expect(comp?.ventajaA).toBe(ComparisonAdvantage.Positive);
	});
});
