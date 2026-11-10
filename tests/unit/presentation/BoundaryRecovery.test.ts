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
	type ReportExportPort
} from '$application';
import { ok } from '$domain';
import { SimulatorState } from '$presentation/state/SimulatorState.svelte';
import { FakeSettingsRepository } from '../../fakes/FakeSettingsRepository';

function createTestState(repo: FakeSettingsRepository): SimulatorState {
	const calcSim = new CalculateSimulationUseCase();
	const calcPair = new CalculatePairMatrixUseCase();

	const mockExport: ReportExportPort = {
		exportReport: vi.fn(async () => ok(undefined)),
		printReport: vi.fn(async () => ok(undefined))
	};

	const loadSettings = new LoadSettingsUseCase(repo);
	const saveSettings = new SaveSettingsUseCase(repo);
	const listPortfolios = new ListPortfoliosUseCase(repo);
	const loadPortfolio = new LoadPortfolioUseCase(repo);
	const savePortfolio = new SavePortfolioUseCase(repo);
	const deletePortfolio = new DeletePortfolioUseCase(repo);
	const renamePortfolio = new RenamePortfolioUseCase(repo);

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

describe('Boundary Recovery & Safe Reset Mechanism', () => {
	it('clears error state, restores default simulation parameters, and persists to repository', async () => {
		const repo = new FakeSettingsRepository();
		const state = createTestState(repo);

		// Initialize state to corrupted / invalid state
		state.montoInicial = 999999999;
		state.aporteMensual = 888888;
		state.tasaInflacion = 25.5;
		state.addAporteExtraordinario(100000, '2026-12-01', 'Aguinaldo');
		state.errorMessage = 'Fatal Error: Out of bounds simulation computation failure';

		expect(state.errorMessage).toBe('Fatal Error: Out of bounds simulation computation failure');
		expect(state.aportesExtraordinarios).toHaveLength(1);

		// Execute safe recovery as invoked by svelte:boundary button #btn-restore-safe-state
		let resetBoundaryCalled = false;
		const resetBoundary = () => {
			resetBoundaryCalled = true;
		};

		await state.resetToSafeDefaults();
		resetBoundary();

		// Verify reset boundary was triggered
		expect(resetBoundaryCalled).toBe(true);

		// Verify state was restored to safe defaults
		expect(state.errorMessage).toBe('');
		expect(state.montoInicial).toBe(185);
		expect(state.aporteMensual).toBe(0);
		expect(state.tasaInflacion).toBe(0);
		expect(state.aportesExtraordinarios).toHaveLength(0);
		expect(state.diaCorte).toBe(16);
		expect(state.omitirPrimerCorte).toBe(false);
		expect(state.aplicarImpuesto).toBe(true);
		expect(state.inversiones).toHaveLength(2);
		expect(state.inversiones[0]?.tasaAnual).toBe(10);
		expect(state.inversiones[1]?.tasaAnual).toBe(12);

		// Verify safe state was persisted to repository
		const loadResult = await repo.loadSettings();
		expect(loadResult.ok).toBe(true);
		if (loadResult.ok) {
			expect(loadResult.value.montoInicial).toBe(185);
			expect(loadResult.value.aporteMensual).toBe(0);
			expect(loadResult.value.tasaInflacion).toBe(0);
			expect(loadResult.value.aportesExtraordinarios).toHaveLength(0);
		}
	});

	it('handles repository save failures during safe recovery gracefully without throwing', async () => {
		const repo = new FakeSettingsRepository();
		repo.shouldFail = true;
		repo.error = new Error('IndexedDB disk quota exceeded');
		const state = createTestState(repo);

		state.errorMessage = 'Initial error';
		await expect(state.resetToSafeDefaults()).resolves.not.toThrow();

		// Defaults should still be applied in memory even if storage write fails
		expect(state.montoInicial).toBe(185);
		expect(state.aporteMensual).toBe(0);
		expect(state.errorMessage).toBe('IndexedDB disk quota exceeded');
	});
});
