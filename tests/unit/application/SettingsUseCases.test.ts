import { beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_SETTINGS_DTO,
	LoadSettingsUseCase,
	SaveSettingsUseCase,
	type PortfolioDTO,
	type PortfolioSummaryDTO,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';
import { err, ok, type Result } from '$domain';

class InMemorySettingsRepositoryStub implements SettingsRepositoryPort {
	public storedSettings: SettingsDTO | null = null;
	public shouldFailLoad = false;
	public shouldFailSave = false;
	public shouldThrowOnLoad = false;
	public shouldThrowOnSave = false;
	public error = new Error('Database connection failed');

	async loadSettings(): Promise<Result<SettingsDTO, Error>> {
		if (this.shouldThrowOnLoad) {
			throw new Error('Catastrophic DB crash on load');
		}
		if (this.shouldFailLoad) {
			return err(this.error);
		}
		return ok(this.storedSettings ?? DEFAULT_SETTINGS_DTO);
	}

	async saveSettings(settings: SettingsDTO): Promise<Result<void, Error>> {
		if (this.shouldThrowOnSave) {
			throw new Error('Catastrophic DB crash on save');
		}
		if (this.shouldFailSave) {
			return err(this.error);
		}
		this.storedSettings = settings;
		return ok(undefined);
	}

	async listPortfolios(): Promise<Result<PortfolioSummaryDTO[], Error>> {
		return ok<PortfolioSummaryDTO[]>([]);
	}

	async loadPortfolio(_id: string): Promise<Result<PortfolioDTO, Error>> {
		return err(new Error('Portfolio no encontrado'));
	}

	async savePortfolio(_portfolio: PortfolioDTO): Promise<Result<void, Error>> {
		return ok<void>(undefined);
	}

	async deletePortfolio(_id: string): Promise<Result<void, Error>> {
		return ok<void>(undefined);
	}

	async isTutorialCompleted(): Promise<Result<boolean, Error>> {
		return ok<boolean>(false);
	}

	async setTutorialCompleted(_completed: boolean): Promise<Result<void, Error>> {
		return ok<void>(undefined);
	}
}

describe('Settings Use Cases (LoadSettingsUseCase & SaveSettingsUseCase)', () => {
	let repository: InMemorySettingsRepositoryStub;
	let loadUseCase: LoadSettingsUseCase;
	let saveUseCase: SaveSettingsUseCase;

	beforeEach(() => {
		repository = new InMemorySettingsRepositoryStub();
		loadUseCase = new LoadSettingsUseCase(repository);
		saveUseCase = new SaveSettingsUseCase(repository);
	});

	describe('LoadSettingsUseCase', () => {
		it('returns default settings when repository is empty', async () => {
			const result = await loadUseCase.execute();
			expect(result.ok).toBe(true);
			if (!result.ok) return;

			expect(result.value.montoInicial).toBe(185);
			expect(result.value.inversiones.length).toBe(2);
			expect(result.value.id).toBe('current');
		});

		it('returns stored settings when available in repository', async () => {
			repository.storedSettings = {
				id: 'current',
				montoInicial: 5000,
				aporteMensual: 1000,
				inversiones: [
					{ id: 'inv-1', nombre: 'Plazo Fijo', tasaAnual: 11.5, color: 'blue' }
				],
				fechaInicio: '2026-01-01',
				fechaFin: '2026-12-31',
				diaCorte: 15,
				omitirPrimerCorte: true,
				aplicarImpuesto: false,
				isDarkMode: true
			};

			const result = await loadUseCase.execute();
			expect(result.ok).toBe(true);
			if (!result.ok) return;

			expect(result.value.montoInicial).toBe(5000);
			expect(result.value.aporteMensual).toBe(1000);
			expect(result.value.isDarkMode).toBe(true);
			expect(result.value.aplicarImpuesto).toBe(false);
		});

		it('propagates error when repository fails to load', async () => {
			repository.shouldFailLoad = true;

			const result = await loadUseCase.execute();
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toBe('Database connection failed');
			}
		});

		it('catches and wraps unexpected repository rejections during load', async () => {
			repository.shouldThrowOnLoad = true;

			const result = await loadUseCase.execute();
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('Catastrophic DB crash on load');
			}
		});
	});

	describe('SaveSettingsUseCase', () => {
		const validSettings: SettingsDTO = {
			id: 'current',
			montoInicial: 2500,
			aporteMensual: 200,
			inversiones: [
				{ id: 'inv-1', nombre: 'Certificado', tasaAnual: 13, color: 'emerald' }
			],
			fechaInicio: '2026-05-01',
			fechaFin: '2026-12-01',
			diaCorte: 20,
			omitirPrimerCorte: false,
			aplicarImpuesto: true,
			isDarkMode: false
		};

		it('successfully validates and persists valid settings', async () => {
			const result = await saveUseCase.execute(validSettings);
			expect(result.ok).toBe(true);

			expect(repository.storedSettings).toBeDefined();
			expect(repository.storedSettings?.montoInicial).toBe(2500);
			expect(repository.storedSettings?.aporteMensual).toBe(200);
			expect(repository.storedSettings?.diaCorte).toBe(20);
			expect(repository.storedSettings?.inversiones.length).toBe(1);
			expect(repository.storedSettings?.id).toBe('current');
		});

		it('preserves custom preset id if present in input', async () => {
			const customPresetSettings = {
				...validSettings,
				id: 'preset-aggressive'
			};

			const result = await saveUseCase.execute(customPresetSettings);
			expect(result.ok).toBe(true);
			expect(repository.storedSettings?.id).toBe('preset-aggressive');
		});

		it('validates and rejects settings with reversed date range (fechaInicio >= fechaFin)', async () => {
			const invalidDateSettings = {
				...validSettings,
				fechaInicio: '2026-12-01',
				fechaFin: '2026-05-01'
			};

			const result = await saveUseCase.execute(invalidDateSettings);
			expect(result.ok).toBe(false);
			expect(repository.storedSettings).toBeNull();
			if (!result.ok) {
				expect(result.error.message).toContain('anterior a la fecha de fin');
			}
		});

		it('validates and rejects settings with invalid data type or negative amounts', async () => {
			const invalidAmountSettings = {
				...validSettings,
				montoInicial: -100
			};

			const result = await saveUseCase.execute(invalidAmountSettings);
			expect(result.ok).toBe(false);
			expect(repository.storedSettings).toBeNull();
		});

		it('validates and rejects settings with invalid diaCorte', async () => {
			const invalidCutoffSettings = {
				...validSettings,
				diaCorte: 35
			};

			const result = await saveUseCase.execute(invalidCutoffSettings);
			expect(result.ok).toBe(false);
			expect(repository.storedSettings).toBeNull();
		});

		it('propagates error when repository save fails', async () => {
			repository.shouldFailSave = true;

			const result = await saveUseCase.execute(validSettings);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toBe('Database connection failed');
			}
		});

		it('catches and wraps unexpected repository rejections during save', async () => {
			repository.shouldThrowOnSave = true;

			const result = await saveUseCase.execute(validSettings);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('Catastrophic DB crash on save');
			}
		});
	});
});
