import { describe, expect, it, vi } from 'vitest';
import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	DeletePortfolioUseCase,
	ListPortfoliosUseCase,
	LoadPortfolioUseCase,
	LoadSettingsUseCase,
	RenamePortfolioUseCase,
	SavePortfolioUseCase,
	SaveSettingsUseCase,
	type PortfolioDTO,
	type PortfolioSummaryDTO,
	type ReportExportPort,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';
import { SimulatorState } from '$presentation/state/SimulatorState.svelte';
import { err, ok } from '$domain';

function createTestState(customRepo?: SettingsRepositoryPort): SimulatorState {
	const calcSim = new CalculateSimulationUseCase();
	const calcPair = new CalculatePairMatrixUseCase();

	const mockRepo: SettingsRepositoryPort = customRepo ?? {
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
		saveSettings: vi.fn(async () => ok(undefined)),
		listPortfolios: vi.fn(async () => ok<PortfolioSummaryDTO[]>([])),
		loadPortfolio: vi.fn(async () => err(new Error('Not found'))),
		savePortfolio: vi.fn(async () => ok(undefined)),
		deletePortfolio: vi.fn(async () => ok(undefined)),
		isTutorialCompleted: vi.fn(async () => ok(false)),
		setTutorialCompleted: vi.fn(async () => ok(undefined))
	};

	const mockExport: ReportExportPort = {
		exportReport: vi.fn(async () => ok<void>(undefined)),
		printReport: vi.fn(async () => ok<void>(undefined))
	};

	const loadSettings = new LoadSettingsUseCase(mockRepo);
	const saveSettings = new SaveSettingsUseCase(mockRepo);
	const listPortfolios = new ListPortfoliosUseCase(mockRepo);
	const loadPortfolio = new LoadPortfolioUseCase(mockRepo);
	const savePortfolio = new SavePortfolioUseCase(mockRepo);
	const deletePortfolio = new DeletePortfolioUseCase(mockRepo);
	const renamePortfolio = new RenamePortfolioUseCase(mockRepo);

	return new SimulatorState(
		calcSim,
		calcPair,
		loadSettings,
		saveSettings,
		mockExport,
		listPortfolios,
		loadPortfolio,
		savePortfolio,
		deletePortfolio,
		renamePortfolio
	);
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

	it('manages multi-portfolios (Phase 11)', async () => {
		const portfoliosList: PortfolioDTO[] = [
			{
				id: 'p-1',
				name: 'Portafolio Base',
				settings: {
					id: 'p-1',
					montoInicial: 200,
					aporteMensual: 50,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-06-01',
					diaCorte: 15,
					omitirPrimerCorte: false,
					aplicarImpuesto: true,
					isDarkMode: false,
					inversiones: [
						{ id: 'inv-1', nombre: 'Escenario 1', tasaAnual: 10, color: 'blue' },
						{ id: 'inv-2', nombre: 'Escenario 2', tasaAnual: 12, color: 'emerald' }
					]
				},
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01'
			}
		];

		const customRepo: SettingsRepositoryPort = {
			loadSettings: vi.fn(async () => ok(portfoliosList[0]!.settings)),
			saveSettings: vi.fn(async () => ok(undefined)),
			listPortfolios: vi.fn(async () =>
				ok(
					portfoliosList.map((p) => ({
						id: p.id,
						name: p.name,
						updatedAt: p.updatedAt,
						escenariosCount: p.settings.inversiones.length,
						montoInicial: p.settings.montoInicial
					}))
				)
			),
			loadPortfolio: vi.fn(async (id: string) => {
				const match = portfoliosList.find((p) => p.id === id);
				return match ? ok(match) : err(new Error('No encontrado'));
			}),
			savePortfolio: vi.fn(async (portfolio: PortfolioDTO) => {
				const idx = portfoliosList.findIndex((p) => p.id === portfolio.id);
				if (idx >= 0) portfoliosList[idx] = portfolio;
				else portfoliosList.push(portfolio);
				return ok(undefined);
			}),
			deletePortfolio: vi.fn(async (id: string) => {
				const idx = portfoliosList.findIndex((p) => p.id === id);
				if (idx >= 0) portfoliosList.splice(idx, 1);
				return ok(undefined);
			}),
			isTutorialCompleted: vi.fn(async () => ok(false)),
			setTutorialCompleted: vi.fn(async () => ok(undefined))
		};

		const state = createTestState(customRepo);
		await state.loadFromStorage();

		expect(state.portfolios).toHaveLength(1);
		expect(state.currentPortfolioName).toBe('Portafolio Base');

		// Crear nuevo portafolio
		const created = await state.createPortfolio('Portafolio Crecimiento');
		expect(created).toBe(true);
		expect(state.currentPortfolioName).toBe('Portafolio Crecimiento');
		expect(state.portfolios).toHaveLength(2);

		// Renombrar portafolio
		const renamed = await state.renamePortfolio(state.currentPortfolioId, 'Portafolio Alto Riesgo');
		expect(renamed).toBe(true);
		expect(state.currentPortfolioName).toBe('Portafolio Alto Riesgo');

		// Alternar al primer portafolio
		const switched = await state.switchPortfolio('p-1');
		expect(switched).toBe(true);
		expect(state.currentPortfolioId).toBe('p-1');
		expect(state.currentPortfolioName).toBe('Portafolio Base');

		// Eliminar el segundo portafolio
		const p2Id = portfoliosList[1]!.id;
		const deleted = await state.deletePortfolio(p2Id);
		expect(deleted).toBe(true);
		expect(state.portfolios).toHaveLength(1);
	});

	it('persists and restores active portfolio id across reloads', async () => {
		let currentSettings: SettingsDTO = {
			id: 'current',
			activePortfolioId: 'p-2',
			montoInicial: 800,
			aporteMensual: 100,
			fechaInicio: '2026-01-01',
			fechaFin: '2026-06-01',
			diaCorte: 15,
			omitirPrimerCorte: false,
			aplicarImpuesto: true,
			isDarkMode: false,
			inversiones: [
				{ id: 'inv-1', nombre: 'Escenario 1', tasaAnual: 10, color: 'blue' },
				{ id: 'inv-2', nombre: 'Escenario 2', tasaAnual: 12, color: 'emerald' }
			]
		};

		const portfoliosList: PortfolioDTO[] = [
			{
				id: 'p-1',
				name: 'Portafolio 1',
				settings: { ...currentSettings, id: 'p-1' },
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01'
			},
			{
				id: 'p-2',
				name: 'Portafolio 2',
				settings: { ...currentSettings, id: 'p-2' },
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01'
			}
		];

		const customRepo: SettingsRepositoryPort = {
			loadSettings: vi.fn(async () => ok(currentSettings)),
			saveSettings: vi.fn(async (s) => {
				currentSettings = s;
				return ok(undefined);
			}),
			listPortfolios: vi.fn(async () =>
				ok(
					portfoliosList.map((p) => ({
						id: p.id,
						name: p.name,
						updatedAt: p.updatedAt,
						escenariosCount: p.settings.inversiones.length,
						montoInicial: p.settings.montoInicial
					}))
				)
			),
			loadPortfolio: vi.fn(async (id: string) => {
				const match = portfoliosList.find((p) => p.id === id);
				return match ? ok(match) : err(new Error('No encontrado'));
			}),
			savePortfolio: vi.fn(async (portfolio: PortfolioDTO) => {
				const idx = portfoliosList.findIndex((p) => p.id === portfolio.id);
				if (idx >= 0) portfoliosList[idx] = portfolio;
				else portfoliosList.push(portfolio);
				return ok(undefined);
			}),
			deletePortfolio: vi.fn(async (id: string) => {
				const idx = portfoliosList.findIndex((p) => p.id === id);
				if (idx >= 0) portfoliosList.splice(idx, 1);
				return ok(undefined);
			}),
			isTutorialCompleted: vi.fn(async () => ok(false)),
			setTutorialCompleted: vi.fn(async () => ok(undefined))
		};

		const state = createTestState(customRepo);
		await state.loadFromStorage();

		// Should have loaded p-2 as active because activePortfolioId was p-2
		expect(state.currentPortfolioId).toBe('p-2');
		expect(state.currentPortfolioName).toBe('Portafolio 2');

		// Modify values and call saveCurrentPortfolio
		state.montoInicial = 950;
		const saved = await state.saveCurrentPortfolio();
		expect(saved).toBe(true);

		// Verified that activePortfolioId was saved in settings
		expect(currentSettings.activePortfolioId).toBe('p-2');
		expect(currentSettings.montoInicial).toBe(950);

		// And verified portfolio record was updated in portfolio store
		const p2 = portfoliosList.find((p) => p.id === 'p-2');
		expect(p2?.settings.montoInicial).toBe(950);
	});
});
