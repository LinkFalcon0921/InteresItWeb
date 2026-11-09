import { describe, expect, it } from 'vitest';
import {
	CalculateSimulationUseCase,
	type SimulationInputDTO
} from '$application';
import { ScenarioRole } from '$domain';

describe('CalculateSimulationUseCase Unit Tests', () => {
	const useCase = new CalculateSimulationUseCase();

	const baseValidInput: SimulationInputDTO = {
		capitalInicial: 185,
		aporteMensual: 0,
		fechaInicio: '2026-04-17',
		fechaFin: '2026-11-16',
		diaCorte: 16,
		omitirPrimerCorte: false,
		aplicarImpuestoRD: true,
		escenarios: [
			{ id: 'inv-1', nombre: 'Conservador', tasaAnual: 10, color: 'emerald' },
			{ id: 'inv-2', nombre: 'Agresivo', tasaAnual: 12, color: 'blue' }
		]
	};

	it('successfully executes simulation and returns SimulationOutputDTO matching expected domain values', () => {
		const result = useCase.execute(baseValidInput);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const dto = result.value;
		expect(dto.capitalInicial).toBe(185);
		expect(dto.aporteMensual).toBe(0);
		expect(dto.totalAportado).toBe(0);
		expect(dto.totalInvertido).toBe(185);
		expect(dto.periodos).toHaveLength(7);
		expect(dto.resumenPorEscenario).toHaveLength(2);

		// Escenario 2 (12%) should be the leader over Escenario 1 (10%)
		expect(dto.escenarioLiderId).toBe('inv-2');
		expect(dto.ventajaLider).toBeGreaterThan(0);

		const summary1 = dto.resumenPorEscenario.find((s) => s.escenarioId === 'inv-1');
		const summary2 = dto.resumenPorEscenario.find((s) => s.escenarioId === 'inv-2');

		expect(summary1?.escenarioId).toBe('inv-1');
		expect(summary2?.escenarioId).toBe('inv-2');

		if (summary1 && summary2) {
			expect(summary1.rol).toBe(ScenarioRole.Challenger);
			expect(summary2.rol).toBe(ScenarioRole.Leader);
			expect(summary2.balanceFinal).toBeGreaterThan(summary1.balanceFinal);
			expect(summary2.rendimientoNeto).toBeGreaterThan(summary1.rendimientoNeto);
		}

		// First period checks
		const firstPeriod = dto.periodos[0];
		expect(firstPeriod?.periodoIndex).toBe(1);
		if (firstPeriod) {
			expect(firstPeriod.periodoIndex).toBe(1);
			expect(firstPeriod.fechaInicio).toBe('2026-04-17');
			expect(firstPeriod.fechaCorte).toBe('2026-05-16');
			expect(firstPeriod.diasPeriodo).toBe(29);
			expect(firstPeriod.resultadosPorEscenario).toHaveLength(2);
		}
	});

	it('correctly handles simulations with monthly contributions (PMT > 0)', () => {
		const inputWithPMT: SimulationInputDTO = {
			...baseValidInput,
			capitalInicial: 1000,
			aporteMensual: 500,
			escenarios: [
				{ id: 'inv-1', nombre: 'Fondo A', tasaAnual: 10, color: 'emerald' }
			]
		};

		const result = useCase.execute(inputWithPMT);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		const dto = result.value;
		expect(dto.capitalInicial).toBe(1000);
		expect(dto.aporteMensual).toBe(500);
		expect(dto.totalAportado).toBe(500 * 7);
		expect(dto.totalInvertido).toBe(1000 + 500 * 7);
		expect(dto.resumenPorEscenario[0]?.balanceFinal).toBeGreaterThan(dto.totalInvertido);
	});

	it('returns error when input object is missing or invalid', () => {
		const resultNull = useCase.execute(null);
		expect(resultNull.ok).toBe(false);

		const resultString = useCase.execute('invalid-string');
		expect(resultString.ok).toBe(false);

		const resultNumber = useCase.execute(12345);
		expect(resultNumber.ok).toBe(false);
	});

	it('returns error when capitalInicial is negative', () => {
		const result = useCase.execute({
			...baseValidInput,
			capitalInicial: -50
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain('negativo');
		}
	});

	it('returns error when aporteMensual is negative', () => {
		const result = useCase.execute({
			...baseValidInput,
			aporteMensual: -10
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain('negativo');
		}
	});

	it('returns error when date range is reversed (fechaInicio >= fechaFin)', () => {
		const result = useCase.execute({
			...baseValidInput,
			fechaInicio: '2026-11-16',
			fechaFin: '2026-04-17'
		});
		expect(result.ok).toBe(false);
	});

	it('returns error when diaCorte is out of valid bounds (1 - 31)', () => {
		const resultTooLow = useCase.execute({
			...baseValidInput,
			diaCorte: 0
		});
		expect(resultTooLow.ok).toBe(false);

		const resultTooHigh = useCase.execute({
			...baseValidInput,
			diaCorte: 32
		});
		expect(resultTooHigh.ok).toBe(false);
	});

	it('returns error when escenarios is not an array or is empty', () => {
		const resultEmpty = useCase.execute({
			...baseValidInput,
			escenarios: []
		});
		expect(resultEmpty.ok).toBe(false);
		if (!resultEmpty.ok) {
			expect(resultEmpty.error.message).toContain('al menos un escenario');
		}

		const resultNotArray = useCase.execute({
			...baseValidInput,
			escenarios: 'not-an-array'
		});
		expect(resultNotArray.ok).toBe(false);
	});

	it('returns error when more than 200 scenarios are provided', () => {
		const manyScenarios = Array.from({ length: 201 }, (_, i) => ({
			id: `inv-${i + 1}`,
			nombre: `Escenario ${i + 1}`,
			tasaAnual: 10,
			color: 'emerald'
		}));

		const result = useCase.execute({
			...baseValidInput,
			escenarios: manyScenarios
		});
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain('No se pueden simular más de 200');
		}
	});

	it('successfully calculates simulation with 100+ concurrent scenarios', () => {
		const scenarios105 = Array.from({ length: 105 }, (_, i) => ({
			id: `inv-${i + 1}`,
			nombre: `Escenario ${i + 1}`,
			tasaAnual: 8 + i * 0.1,
			color: 'emerald'
		}));
		const result = useCase.execute({
			...baseValidInput,
			escenarios: scenarios105
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.resumenPorEscenario).toHaveLength(105);
		}
	});

	it('returns error when scenario has duplicate id', () => {
		const resultDuplicate = useCase.execute({
			...baseValidInput,
			escenarios: [
				{ id: 'inv-1', nombre: 'Escenario A', tasaAnual: 10, color: 'emerald' },
				{ id: 'inv-1', nombre: 'Escenario B', tasaAnual: 12, color: 'blue' }
			]
		});
		expect(resultDuplicate.ok).toBe(false);
		if (!resultDuplicate.ok) {
			expect(resultDuplicate.error.message).toContain('duplicado');
		}
	});

	it('returns error when scenario entry is null or not an object', () => {
		const resultInvalidEntry = useCase.execute({
			...baseValidInput,
			escenarios: [null]
		});
		expect(resultInvalidEntry.ok).toBe(false);
		if (!resultInvalidEntry.ok) {
			expect(resultInvalidEntry.error.message).toContain('inválido');
		}
	});

	it('returns error when scenario has invalid interest rate', () => {
		const result = useCase.execute({
			...baseValidInput,
			escenarios: [
				{ id: 'inv-1', nombre: 'Invalido', tasaAnual: -5, color: 'emerald' }
			]
		});
		expect(result.ok).toBe(false);
	});

	it('returns error when scenario has empty id or name', () => {
		const resultEmptyName = useCase.execute({
			...baseValidInput,
			escenarios: [
				{ id: 'inv-1', nombre: '', tasaAnual: 10, color: 'emerald' }
			]
		});
		expect(resultEmptyName.ok).toBe(false);

		const resultEmptyId = useCase.execute({
			...baseValidInput,
			escenarios: [
				{ id: '   ', nombre: 'Test', tasaAnual: 10, color: 'emerald' }
			]
		});
		expect(resultEmptyId.ok).toBe(false);
	});
});
