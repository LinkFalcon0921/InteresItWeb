import { describe, expect, it, vi } from 'vitest';
import {
	ExportBackupUseCase,
	ImportBackupUseCase,
	DEFAULT_SETTINGS_DTO,
	DEFAULT_PORTFOLIO_ID,
	DEFAULT_PORTFOLIO_NAME,
	type PortfolioDTO,
	type PortfolioSummaryDTO,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';
import { ok, err } from '$domain';

describe('BackupUseCases (Application)', () => {
	const mockPortfolio: PortfolioDTO = {
		id: DEFAULT_PORTFOLIO_ID,
		name: DEFAULT_PORTFOLIO_NAME,
		settings: {
			...DEFAULT_SETTINGS_DTO,
			id: DEFAULT_PORTFOLIO_ID
		},
		createdAt: '2026-11-08T00:00:00.000Z',
		updatedAt: '2026-11-08T00:00:00.000Z'
	};

	const mockSummary: PortfolioSummaryDTO = {
		id: DEFAULT_PORTFOLIO_ID,
		name: DEFAULT_PORTFOLIO_NAME,
		updatedAt: '2026-11-08T00:00:00.000Z',
		escenariosCount: 2,
		montoInicial: 185
	};

	function createMockRepository(overrides?: Partial<SettingsRepositoryPort>): SettingsRepositoryPort {
		return {
			loadSettings: vi.fn().mockResolvedValue(ok(DEFAULT_SETTINGS_DTO)),
			saveSettings: vi.fn().mockResolvedValue(ok(undefined)),
			listPortfolios: vi.fn().mockResolvedValue(ok([mockSummary])),
			loadPortfolio: vi.fn().mockResolvedValue(ok(mockPortfolio)),
			savePortfolio: vi.fn().mockResolvedValue(ok(undefined)),
			deletePortfolio: vi.fn().mockResolvedValue(ok(undefined)),
			isTutorialCompleted: vi.fn().mockResolvedValue(ok(false)),
			setTutorialCompleted: vi.fn().mockResolvedValue(ok(undefined)),
			...overrides
		};
	}

	describe('ExportBackupUseCase', () => {
		it('should export all portfolios and settings into BackupDTO', async () => {
			const repo = createMockRepository();
			const useCase = new ExportBackupUseCase(repo);

			const result = await useCase.execute();
			if (!result.ok) return;

			expect(result.value.app).toBe('InteresIt');
			expect(result.value.version).toBe('2.2.0');
			expect(result.value.portfolios).toHaveLength(1);
			expect(result.value.settings.montoInicial).toBe(185);
			expect(repo.loadSettings).toHaveBeenCalled();
			expect(repo.listPortfolios).toHaveBeenCalled();
			expect(repo.loadPortfolio).toHaveBeenCalledWith(DEFAULT_PORTFOLIO_ID);
		});

		it('should return error when repository fails loading settings', async () => {
			const repo = createMockRepository({
				loadSettings: vi.fn().mockResolvedValue(err(new Error('DB failure')))
			});
			const useCase = new ExportBackupUseCase(repo);

			const result = await useCase.execute();
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.error.message).toBe('DB failure');
		});
	});

	describe('ImportBackupUseCase', () => {
		it('should validate and restore valid JSON string backup', async () => {
			const repo = createMockRepository();
			const useCase = new ImportBackupUseCase(repo);

			const validJson = JSON.stringify({
				version: '2.2.0',
				app: 'InteresIt',
				exportedAt: '2026-11-08T00:00:00.000Z',
				settings: DEFAULT_SETTINGS_DTO,
				portfolios: [mockPortfolio]
			});

			const result = await useCase.execute(validJson);
			expect(result.ok).toBe(true);
			expect(repo.savePortfolio).toHaveBeenCalledWith(mockPortfolio);
			expect(repo.saveSettings).toHaveBeenCalledWith({
				...DEFAULT_SETTINGS_DTO,
				activePortfolioId: DEFAULT_PORTFOLIO_ID
			});
		});

		it('should reject invalid JSON text', async () => {
			const repo = createMockRepository();
			const useCase = new ImportBackupUseCase(repo);

			const result = await useCase.execute('{ invalid json');
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.error.message).toContain('JSON válida');
		});

		it('should reject malformed schema structure', async () => {
			const repo = createMockRepository();
			const useCase = new ImportBackupUseCase(repo);

			const malformed = JSON.stringify({
				version: '2.2.0',
				app: 'NotInteresIt',
				exportedAt: '2026-11-08T00:00:00.000Z',
				portfolios: []
			});

			const result = await useCase.execute(malformed);
			expect(result.ok).toBe(false);
			if (result.ok) return;
			expect(result.error.message).toContain('Copia de seguridad inválida');
		});

		it('should delete existing portfolios not present in the backup when restoring', async () => {
			const repo = createMockRepository({
				listPortfolios: vi.fn().mockResolvedValue(
					ok([
						mockSummary,
						{
							id: 'obsolete-portfolio',
							name: 'Obsoleto',
							updatedAt: '2026-11-08T00:00:00.000Z',
							escenariosCount: 2,
							montoInicial: 100
						}
					])
				)
			});
			const useCase = new ImportBackupUseCase(repo);

			const validJson = JSON.stringify({
				version: '2.2.0',
				app: 'InteresIt',
				exportedAt: '2026-11-08T00:00:00.000Z',
				settings: DEFAULT_SETTINGS_DTO,
				portfolios: [mockPortfolio]
			});

			const result = await useCase.execute(validJson);
			expect(result.ok).toBe(true);
			expect(repo.deletePortfolio).toHaveBeenCalledWith('obsolete-portfolio');
			expect(repo.deletePortfolio).not.toHaveBeenCalledWith(DEFAULT_PORTFOLIO_ID);
		});
	});
});
