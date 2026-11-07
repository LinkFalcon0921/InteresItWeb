import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as svelte from 'svelte';
import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	LoadSettingsUseCase,
	SaveSettingsUseCase,
	type ReportExportOptions,
	type ReportExportPort,
	type SettingsDTO,
	type SettingsRepositoryPort,
	type SimulationInputDTO,
	type SimulationOutputDTO
} from '$application';
import {
	IndexedDBSettingsRepository,
	PrintExportAdapter
} from '$infrastructure';
import {
	CONTAINER_CONTEXT_KEY,
	createAppContainer,
	createSimulatorState,
	getAppContainer,
	getContainerContext,
	resetAppContainer,
	setContainerContext,
	type AppContainer
} from '$di';
import { ok } from '$domain';

const sampleSettings: SettingsDTO = {
	id: 'current',
	montoInicial: 500,
	aporteMensual: 50,
	fechaInicio: '2026-01-01',
	fechaFin: '2026-07-01',
	diaCorte: 15,
	omitirPrimerCorte: false,
	aplicarImpuesto: true,
	isDarkMode: false,
	inversiones: [
		{ id: 'inv-1', nombre: 'Plazo Fijo', tasaAnual: 12, color: 'blue' },
		{ id: 'inv-2', nombre: 'Fondo Mutuo', tasaAnual: 14, color: 'emerald' }
	]
};

function createMockRepository(): SettingsRepositoryPort {
	return {
		loadSettings: vi.fn(async () => ok(sampleSettings)),
		saveSettings: vi.fn(async () => ok(undefined))
	};
}

function createMockExportAdapter(): ReportExportPort {
	return {
		exportReport: vi.fn(async (_data: SimulationOutputDTO, _options?: ReportExportOptions) =>
			ok(undefined)
		),
		printReport: vi.fn(async () => ok(undefined))
	};
}

describe('DI Container — createAppContainer', () => {
	afterEach(() => {
		resetAppContainer();
		vi.restoreAllMocks();
	});

	it('wires default implementations when no overrides are provided', () => {
		const container = createAppContainer();

		expect(container.calculateSimulation).toBeInstanceOf(CalculateSimulationUseCase);
		expect(container.calculatePairMatrix).toBeInstanceOf(CalculatePairMatrixUseCase);
		expect(container.loadSettings).toBeInstanceOf(LoadSettingsUseCase);
		expect(container.saveSettings).toBeInstanceOf(SaveSettingsUseCase);
		expect(container.settingsRepository).toBeInstanceOf(IndexedDBSettingsRepository);
		expect(container.reportExport).toBeInstanceOf(PrintExportAdapter);
	});

	it('allows overriding settingsRepository and cascades it to settings use cases', async () => {
		const mockRepo = createMockRepository();
		const container = createAppContainer({ settingsRepository: mockRepo });

		expect(container.settingsRepository).toBe(mockRepo);

		const loadResult = await container.loadSettings.execute();
		expect(loadResult.ok).toBe(true);
		expect(mockRepo.loadSettings).toHaveBeenCalledTimes(1);

		if (loadResult.ok) {
			expect(loadResult.value.montoInicial).toBe(500);
		}

		const saveResult = await container.saveSettings.execute(sampleSettings);
		expect(saveResult.ok).toBe(true);
		expect(mockRepo.saveSettings).toHaveBeenCalledTimes(1);
	});

	it('allows overriding reportExport adapter', async () => {
		const mockExport = createMockExportAdapter();
		const container = createAppContainer({ reportExport: mockExport });

		expect(container.reportExport).toBe(mockExport);

		const printResult = await container.reportExport.printReport();
		expect(printResult.ok).toBe(true);
		expect(mockExport.printReport).toHaveBeenCalledTimes(1);
	});

	it('allows overriding individual use cases', () => {
		const customCalcSim = new CalculateSimulationUseCase();
		const customCalcPair = new CalculatePairMatrixUseCase();
		const mockRepo = createMockRepository();
		const customLoad = new LoadSettingsUseCase(mockRepo);
		const customSave = new SaveSettingsUseCase(mockRepo);

		const container = createAppContainer({
			calculateSimulation: customCalcSim,
			calculatePairMatrix: customCalcPair,
			loadSettings: customLoad,
			saveSettings: customSave
		});

		expect(container.calculateSimulation).toBe(customCalcSim);
		expect(container.calculatePairMatrix).toBe(customCalcPair);
		expect(container.loadSettings).toBe(customLoad);
		expect(container.saveSettings).toBe(customSave);
	});

	it('handles empty overrides object or undefined cleanly', () => {
		const containerEmpty = createAppContainer({});
		expect(containerEmpty.settingsRepository).toBeInstanceOf(IndexedDBSettingsRepository);
		expect(containerEmpty.reportExport).toBeInstanceOf(PrintExportAdapter);

		const containerUndefined = createAppContainer(undefined);
		expect(containerUndefined.settingsRepository).toBeInstanceOf(IndexedDBSettingsRepository);
		expect(containerUndefined.reportExport).toBeInstanceOf(PrintExportAdapter);
	});

	it('propagates repository errors when executing loadSettings or saveSettings', async () => {
		const failingRepo: SettingsRepositoryPort = {
			loadSettings: vi.fn(async () => {
				throw new Error('Database connection failed');
			}),
			saveSettings: vi.fn(async () => {
				throw new Error('Disk full error');
			})
		};

		const container = createAppContainer({ settingsRepository: failingRepo });

		const loadResult = await container.loadSettings.execute();
		expect(loadResult.ok).toBe(false);
		if (!loadResult.ok) {
			expect(loadResult.error.message).toContain('Database connection failed');
		}

		const saveResult = await container.saveSettings.execute(sampleSettings);
		expect(saveResult.ok).toBe(false);
		if (!saveResult.ok) {
			expect(saveResult.error.message).toContain('Disk full error');
		}
	});
});

describe('DI Container — Use Case Execution via Container', () => {
	it('executes full simulation through container use case', () => {
		const container = createAppContainer();

		const input: SimulationInputDTO = {
			capitalInicial: 1000,
			aporteMensual: 100,
			fechaInicio: '2026-01-01',
			fechaFin: '2026-06-01',
			diaCorte: 15,
			omitirPrimerCorte: false,
			aplicarImpuestoRD: true,
			escenarios: [
				{ id: 'esc-1', nombre: 'Conservador', tasaAnual: 10, color: 'blue' },
				{ id: 'esc-2', nombre: 'Agresivo', tasaAnual: 15, color: 'emerald' }
			]
		};

		const result = container.calculateSimulation.execute(input);
		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.value.escenarioLiderId).toBe('esc-2');
			expect(result.value.resumenPorEscenario).toHaveLength(2);
			expect(result.value.periodos.length).toBeGreaterThan(0);

			const pairResult = container.calculatePairMatrix.execute(result.value.resumenPorEscenario);
			expect(pairResult.ok).toBe(true);

			if (pairResult.ok) {
				expect(pairResult.value.totalPares).toBe(1);
				expect(pairResult.value.comparaciones).toHaveLength(1);
				const firstComparison = pairResult.value.comparaciones[0];
				expect(firstComparison?.escenarioA.escenarioId).toBe('esc-1');
				expect(firstComparison?.escenarioB.escenarioId).toBe('esc-2');
			}
		}
	});

	it('handles simulation errors gracefully through container', () => {
		const container = createAppContainer();
		const invalidInput = {
			capitalInicial: -50,
			aporteMensual: 0,
			fechaInicio: '2026-06-01',
			fechaFin: '2026-01-01',
			diaCorte: 15,
			omitirPrimerCorte: false,
			aplicarImpuestoRD: true,
			escenarios: []
		};

		const result = container.calculateSimulation.execute(invalidInput);
		expect(result.ok).toBe(false);
	});
});

describe('DI Container — Singleton & Context Accessors', () => {
	beforeEach(() => {
		resetAppContainer();
	});

	afterEach(() => {
		resetAppContainer();
		vi.restoreAllMocks();
	});

	it('returns the same singleton instance on repeated getAppContainer calls', () => {
		const firstInstance = getAppContainer();
		const secondInstance = getAppContainer();

		expect(firstInstance).toBe(secondInstance);
	});

	it('creates a new instance after resetAppContainer is called', () => {
		const initialInstance = getAppContainer();
		resetAppContainer();
		const nextInstance = getAppContainer();

		expect(initialInstance).not.toBe(nextInstance);
	});

	it('throws an error when getContainerContext is called outside Svelte context', () => {
		expect(() => getContainerContext()).toThrow(
			/AppContainer no está disponible en el contexto de Svelte/
		);
	});

	it('throws an error when getContainerContext is called in active Svelte context without container', () => {
		vi.spyOn(svelte, 'getContext').mockImplementation(() => undefined);

		expect(() => getContainerContext()).toThrow(
			/AppContainer no está disponible en el contexto de Svelte/
		);
	});

	it('getAppContainer gracefully falls back to singleton outside Svelte context', () => {
		const container = getAppContainer();
		expect(container).toBeDefined();
		expect(container.calculateSimulation).toBeInstanceOf(CalculateSimulationUseCase);
	});

	it('stores and retrieves container using Svelte context API', () => {
		const mockContextStore = new Map<unknown, unknown>();

		vi.spyOn(svelte, 'setContext').mockImplementation((key: unknown, value: unknown) => {
			mockContextStore.set(key, value);
			return value;
		});

		vi.spyOn(svelte, 'getContext').mockImplementation((key: unknown) => {
			return mockContextStore.get(key);
		});

		const testContainer = createAppContainer();
		setContainerContext(testContainer);

		expect(mockContextStore.get(CONTAINER_CONTEXT_KEY)).toBe(testContainer);

		const retrievedFromContext = getContainerContext();
		expect(retrievedFromContext).toBe(testContainer);

		const retrievedViaAppAccessor = getAppContainer();
		expect(retrievedViaAppAccessor).toBe(testContainer);
	});

	it('creates a SimulatorState instance via createSimulatorState', () => {
		const customContainer = createAppContainer();
		const stateWithCustom = createSimulatorState(customContainer);
		expect(stateWithCustom).toBeDefined();
		expect(stateWithCustom.montoInicial).toBe(185);

		const stateWithDefault = createSimulatorState();
		expect(stateWithDefault).toBeDefined();
		expect(stateWithDefault.montoInicial).toBe(185);
	});
});
