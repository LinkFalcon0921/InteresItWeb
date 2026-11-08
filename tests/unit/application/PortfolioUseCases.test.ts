import { beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_PORTFOLIO_ID,
	DEFAULT_PORTFOLIO_NAME,
	DEFAULT_SETTINGS_DTO,
	DeletePortfolioUseCase,
	ListPortfoliosUseCase,
	LoadPortfolioUseCase,
	RenamePortfolioUseCase,
	SavePortfolioUseCase,
	type PortfolioDTO,
	type PortfolioSummaryDTO,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';
import { FakeSettingsRepository } from '../../fakes/FakeSettingsRepository';

describe('Portfolio Use Cases (Phase 11 Clean Architecture)', () => {
	let repository: FakeSettingsRepository;
	let listUseCase: ListPortfoliosUseCase;
	let loadUseCase: LoadPortfolioUseCase;
	let saveUseCase: SavePortfolioUseCase;
	let renameUseCase: RenamePortfolioUseCase;
	let deleteUseCase: DeletePortfolioUseCase;

	const samplePortfolio: PortfolioDTO = {
		id: DEFAULT_PORTFOLIO_ID,
		name: DEFAULT_PORTFOLIO_NAME,
		settings: DEFAULT_SETTINGS_DTO,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z'
	};

	beforeEach(() => {
		repository = new FakeSettingsRepository();
		repository.error = new Error('Simulated repository error');
		repository.portfolios = [{ ...samplePortfolio }];
		listUseCase = new ListPortfoliosUseCase(repository);
		loadUseCase = new LoadPortfolioUseCase(repository);
		saveUseCase = new SavePortfolioUseCase(repository);
		renameUseCase = new RenamePortfolioUseCase(repository);
		deleteUseCase = new DeletePortfolioUseCase(repository);
	});

	describe('ListPortfoliosUseCase', () => {
		it('returns list of portfolios summaries', async () => {
			const result = await listUseCase.execute();
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]?.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(result.value[0]?.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
		});

		it('propagates repository error', async () => {
			repository.shouldFail = true;
			const result = await listUseCase.execute();
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('Simulated repository error');
			}
		});
	});

	describe('LoadPortfolioUseCase', () => {
		it('loads existing portfolio by id', async () => {
			const result = await loadUseCase.execute(DEFAULT_PORTFOLIO_ID);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(result.value.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
		});

		it('rejects empty or whitespace id', async () => {
			const result1 = await loadUseCase.execute('');
			expect(result1.ok).toBe(false);

			const result2 = await loadUseCase.execute('   ');
			expect(result2.ok).toBe(false);
		});

		it('returns error when portfolio does not exist', async () => {
			const result = await loadUseCase.execute('non-existent-id');
			expect(result.ok).toBe(false);
		});
	});

	describe('SavePortfolioUseCase', () => {
		it('saves a new portfolio successfully and trims name and id', async () => {
			const newPortfolio: PortfolioDTO = {
				id: '  port-2  ',
				name: '  Portafolio Secundario  ',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-02-01T00:00:00.000Z',
				updatedAt: '2026-02-01T00:00:00.000Z'
			};

			const result = await saveUseCase.execute(newPortfolio);
			expect(result.ok).toBe(true);

			const listResult = await listUseCase.execute();
			if (listResult.ok) {
				expect(listResult.value).toHaveLength(2);
				const saved = listResult.value.find((p) => p.id === 'port-2');
				expect(saved?.id).toBe('port-2');
				expect(saved?.name).toBe('Portafolio Secundario');
			}
		});

		it('rejects portfolio with empty id or empty name', async () => {
			const bad1: PortfolioDTO = {
				...samplePortfolio,
				id: '   '
			};
			const res1 = await saveUseCase.execute(bad1);
			expect(res1.ok).toBe(false);

			const bad2: PortfolioDTO = {
				...samplePortfolio,
				name: ''
			};
			const res2 = await saveUseCase.execute(bad2);
			expect(res2.ok).toBe(false);

			const bad3: PortfolioDTO = {
				...samplePortfolio,
				name: 'A'.repeat(101)
			};
			const res3 = await saveUseCase.execute(bad3);
			expect(res3.ok).toBe(false);
			if (!res3.ok) {
				expect(res3.error.message).toContain('100 caracteres');
			}

			const bad4 = {
				id: 'port-no-settings',
				name: 'Sin Settings',
				createdAt: '',
				updatedAt: ''
			} as unknown as PortfolioDTO;
			const res4 = await saveUseCase.execute(bad4);
			expect(res4.ok).toBe(false);
			if (!res4.ok) {
				expect(res4.error.message).toContain('configuración');
			}
		});
	});

	describe('RenamePortfolioUseCase', () => {
		it('renames an existing portfolio', async () => {
			const result = await renameUseCase.execute(DEFAULT_PORTFOLIO_ID, 'Portafolio Jubilación');
			expect(result.ok).toBe(true);

			const loadRes = await loadUseCase.execute(DEFAULT_PORTFOLIO_ID);
			if (loadRes.ok) {
				expect(loadRes.value.name).toBe('Portafolio Jubilación');
			}
		});

		it('rejects empty id or whitespace name', async () => {
			const res1 = await renameUseCase.execute('', 'Nuevo');
			expect(res1.ok).toBe(false);

			const res2 = await renameUseCase.execute(DEFAULT_PORTFOLIO_ID, '   ');
			expect(res2.ok).toBe(false);

			const res3 = await renameUseCase.execute(DEFAULT_PORTFOLIO_ID, 'B'.repeat(101));
			expect(res3.ok).toBe(false);
			if (!res3.ok) {
				expect(res3.error.message).toContain('100 caracteres');
			}
		});

		it('fails when portfolio is not found', async () => {
			const res = await renameUseCase.execute('not-found', 'Nuevo Nombre');
			expect(res.ok).toBe(false);
		});
	});

	describe('DeletePortfolioUseCase', () => {
		it('fails to delete if it is the only portfolio', async () => {
			expect(repository.portfolios).toHaveLength(1);
			const result = await deleteUseCase.execute(DEFAULT_PORTFOLIO_ID);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('único portafolio');
			}
		});

		it('deletes portfolio successfully when more than one exists', async () => {
			repository.portfolios.push({
				id: 'port-2',
				name: 'Segundo Portafolio',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-03-01T00:00:00.000Z',
				updatedAt: '2026-03-01T00:00:00.000Z'
			});

			const delResult = await deleteUseCase.execute('port-2');
			expect(delResult.ok).toBe(true);

			const listRes = await listUseCase.execute();
			if (listRes.ok) {
				expect(listRes.value).toHaveLength(1);
				expect(listRes.value[0]?.id).toBe(DEFAULT_PORTFOLIO_ID);
			}
		});

		it('rejects empty id', async () => {
			const res = await deleteUseCase.execute('  ');
			expect(res.ok).toBe(false);
		});
	});
});
