import { describe, expect, it } from 'vitest';
import {
	CalculatePairMatrixUseCase,
	type ScenarioSummaryDTO,
	type SimulationOutputDTO
} from '$application';
import { ComparisonAdvantage, ScenarioRole } from '$domain';

describe('CalculatePairMatrixUseCase Unit Tests', () => {
	const useCase = new CalculatePairMatrixUseCase();

	const summaryA: ScenarioSummaryDTO = {
		escenarioId: 'inv-1',
		nombre: 'Fondo Alfa',
		balanceFinal: 10500.75,
		interesTotalNeto: 500.75,
		rendimientoNeto: 500.75,
		rol: ScenarioRole.Leader
	};

	const summaryB: ScenarioSummaryDTO = {
		escenarioId: 'inv-2',
		nombre: 'Fondo Beta',
		balanceFinal: 10200.25,
		interesTotalNeto: 200.25,
		rendimientoNeto: 200.25,
		rol: ScenarioRole.Challenger
	};

	const summaryC: ScenarioSummaryDTO = {
		escenarioId: 'inv-3',
		nombre: 'Fondo Gamma',
		balanceFinal: 10000.0,
		interesTotalNeto: 0.0,
		rendimientoNeto: 0.0,
		rol: ScenarioRole.Neutral
	};

	it('returns 0 pairs when empty array or fewer than 2 scenarios provided', () => {
		const emptyResult = useCase.execute([]);
		expect(emptyResult.ok).toBe(true);
		if (emptyResult.ok) {
			expect(emptyResult.value.totalPares).toBe(0);
			expect(emptyResult.value.comparaciones).toEqual([]);
		}

		const singleResult = useCase.execute([summaryA]);
		expect(singleResult.ok).toBe(true);
		if (singleResult.ok) {
			expect(singleResult.value.totalPares).toBe(0);
			expect(singleResult.value.comparaciones).toEqual([]);
		}
	});

	it('calculates 1 pair correctly for 2 scenarios with positive advantage for A', () => {
		const result = useCase.execute([summaryA, summaryB]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.totalPares).toBe(1);
		const comp = result.value.comparaciones[0];
		expect(comp).toBeDefined();

		if (comp) {
			expect(comp.escenarioA.escenarioId).toBe('inv-1');
			expect(comp.escenarioB.escenarioId).toBe('inv-2');
			expect(comp.diferenciaBalance).toBe(300.5); // 10500.75 - 10200.25
			expect(comp.diferenciaRendimiento).toBe(300.5);
			expect(comp.favorecidoId).toBe('inv-1');
			expect(comp.ventajaA).toBe(ComparisonAdvantage.Positive);
		}
	});

	it('calculates negative advantage when scenario B is greater than scenario A', () => {
		const result = useCase.execute([summaryB, summaryA]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.totalPares).toBe(1);
		const comp = result.value.comparaciones[0];
		expect(comp).toBeDefined();

		if (comp) {
			expect(comp.escenarioA.escenarioId).toBe('inv-2');
			expect(comp.escenarioB.escenarioId).toBe('inv-1');
			expect(comp.favorecidoId).toBe('inv-1');
			expect(comp.ventajaA).toBe(ComparisonAdvantage.Negative);
		}
	});

	it('calculates neutral advantage when both scenarios have identical final balance', () => {
		const summaryTwin: ScenarioSummaryDTO = {
			...summaryA,
			escenarioId: 'inv-twin',
			nombre: 'Fondo Gemelo'
		};

		const result = useCase.execute([summaryA, summaryTwin]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const comp = result.value.comparaciones[0];
		expect(comp).toBeDefined();
		if (comp) {
			expect(comp.diferenciaBalance).toBe(0);
			expect(comp.favorecidoId).toBe('');
			expect(comp.ventajaA).toBe(ComparisonAdvantage.Neutral);
		}
	});

	it('calculates 3 pairs for 3 scenarios: n * (n - 1) / 2 = 3', () => {
		const result = useCase.execute([summaryA, summaryB, summaryC]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.totalPares).toBe(3);
		expect(result.value.comparaciones.length).toBe(3);
	});

	it('accepts wrapped object with { resumenes: [...] }', () => {
		const result = useCase.execute({ resumenes: [summaryA, summaryB] });
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.totalPares).toBe(1);
	});

	it('accepts full SimulationOutputDTO object', () => {
		const simulationOutput: SimulationOutputDTO = {
			capitalInicial: 1000,
			aporteMensual: 0,
			totalAportado: 0,
			totalInvertido: 1000,
			periodos: [],
			resumenPorEscenario: [summaryA, summaryB, summaryC],
			escenarioLiderId: 'inv-1',
			ventajaLider: 300.5
		};

		const result = useCase.execute(simulationOutput);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.totalPares).toBe(3);
	});
});
