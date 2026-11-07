import { describe, expect, it, vi } from 'vitest';
import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	LoadSettingsUseCase,
	SaveSettingsUseCase,
	type ReportExportPort,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';
import { SimulatorState } from '$presentation/state/SimulatorState.svelte';
import { ok } from '$domain';

function createTestState(): SimulatorState {
	const calcSim = new CalculateSimulationUseCase();
	const calcPair = new CalculatePairMatrixUseCase();

	const mockRepo: SettingsRepositoryPort = {
		loadSettings: vi.fn(async () =>
			ok<SettingsDTO>({
				id: 'current',
				montoInicial: 1000,
				aporteMensual: 100,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-06-01',
				diaCorte: 15,
				omitirPrimerCorte: false,
				aplicarImpuesto: true,
				isDarkMode: true,
				inversiones: [
					{ id: 'inv-1', nombre: 'Certificado 1', tasaAnual: 11, color: 'blue' },
					{ id: 'inv-2', nombre: 'Fondo 2', tasaAnual: 13, color: 'emerald' }
				]
			})
		),
		saveSettings: vi.fn(async () => ok<void>(undefined))
	};

	const mockExport: ReportExportPort = {
		exportReport: vi.fn(async () => ok<void>(undefined)),
		printReport: vi.fn(async () => ok<void>(undefined))
	};

	const loadSettings = new LoadSettingsUseCase(mockRepo);
	const saveSettings = new SaveSettingsUseCase(mockRepo);

	return new SimulatorState(calcSim, calcPair, loadSettings, saveSettings, mockExport);
}

describe('SimulatorState', () => {
	it('initializes with default values and calculates initial simulation', () => {
		const state = createTestState();

		expect(state.montoInicial).toBe(185);
		expect(state.aporteMensual).toBe(0);
		expect(state.inversiones).toHaveLength(2);
		expect(state.simulationResult).not.toBeNull();
		expect(state.escenarioLider).not.toBeNull();
		expect(state.pairMatrixResult).not.toBeNull();
	});

	it('adjusts montoInicial and aporteMensual without going negative', () => {
		const state = createTestState();

		state.adjustMontoInicial(50);
		expect(state.montoInicial).toBe(235);

		state.adjustMontoInicial(-500);
		expect(state.montoInicial).toBe(0);

		state.adjustAporteMensual(100);
		expect(state.aporteMensual).toBe(100);

		state.adjustAporteMensual(-200);
		expect(state.aporteMensual).toBe(0);
	});

	it('updates horizon months properly', () => {
		const state = createTestState();
		state.fechaInicio = '2026-01-01';

		state.setHorizonMonths(6);
		expect(state.fechaFin).toBe('2026-07-01');
	});

	it('manages investment scenarios within limits (min 2, max 20)', () => {
		const state = createTestState();

		state.addInversion('Fondo Nuevo', 14.5);
		expect(state.inversiones).toHaveLength(3);
		expect(state.inversiones[2]?.nombre).toBe('Fondo Nuevo');
		expect(state.inversiones[2]?.tasaAnual).toBe(14.5);

		state.updateInversionTasa('inv-1', 9.5);
		expect(state.inversiones[0]?.tasaAnual).toBe(9.5);

		state.updateInversionNombre('inv-1', 'Renombrado');
		expect(state.inversiones[0]?.nombre).toBe('Renombrado');

		const lastId = state.inversiones[2]?.id ?? '';
		state.removeInversion(lastId);
		expect(state.inversiones).toHaveLength(2);

		// Intentar borrar cuando solo quedan 2 no debe surtir efecto
		state.removeInversion(state.inversiones[0]?.id ?? '');
		expect(state.inversiones).toHaveLength(2);
	});

	it('loads and applies settings from repository', async () => {
		const state = createTestState();
		await state.loadFromStorage();

		expect(state.montoInicial).toBe(1000);
		expect(state.aporteMensual).toBe(100);
		expect(state.diaCorte).toBe(15);
		expect(state.isDarkMode).toBe(true);
	});

	it('saves settings to repository and triggers notification', async () => {
		const state = createTestState();
		const saved = await state.saveToStorage();

		expect(saved).toBe(true);
		expect(state.saveNotificationVisible).toBe(true);
	});

	it('handles export PDF and print calls', async () => {
		const state = createTestState();
		const exported = await state.exportPDF('reporte_test');
		expect(exported).toBe(true);

		const printed = await state.printReport();
		expect(printed).toBe(true);
	});
});
