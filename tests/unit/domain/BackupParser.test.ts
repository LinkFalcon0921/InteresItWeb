import { describe, expect, it } from 'vitest';
import { BackupParser } from '$domain';
import { DEFAULT_SETTINGS_DTO } from '$application';

describe('BackupParser (Domain)', () => {
	const validBackup = {
		version: '2.2.0',
		app: 'InteresIt',
		exportedAt: '2026-11-08T00:00:00.000Z',
		activePortfolioId: 'port-1',
		settings: DEFAULT_SETTINGS_DTO,
		portfolios: [
			{
				id: 'port-1',
				name: 'Mi Portafolio',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-11-08T00:00:00.000Z',
				updatedAt: '2026-11-08T00:00:00.000Z'
			}
		]
	};

	it('should successfully parse and validate a sound backup structure', () => {
		const result = BackupParser.parseBackup(validBackup);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.value.app).toBe('InteresIt');
		expect(result.value.version).toBe('2.2.0');
		expect(result.value.portfolios).toHaveLength(1);
		expect(result.value.activePortfolioId).toBe('port-1');
	});

	it('should reject non-object payloads', () => {
		const result = BackupParser.parseBackup('not an object');
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toBe('backup');
	});

	it('should reject invalid app identifier', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			app: 'OtherApp'
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toBe('app');
	});

	it('should reject missing or empty version', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			version: ''
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toBe('version');
	});

	it('should reject invalid exportedAt timestamp', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			exportedAt: 'invalid-date'
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toBe('exportedAt');
	});

	it('should reject empty or missing portfolios', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			portfolios: []
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toBe('portfolios');
	});

	it('should reject portfolio with invalid or blank name', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			portfolios: [
				{
					id: 'port-1',
					name: '   ',
					settings: DEFAULT_SETTINGS_DTO,
					createdAt: '2026-11-08T00:00:00.000Z',
					updatedAt: '2026-11-08T00:00:00.000Z'
				}
			]
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toContain('name');
	});

	it('should reject corrupt settings in portfolio', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			portfolios: [
				{
					id: 'port-1',
					name: 'Portafolio Malo',
					settings: {
						montoInicial: -500 // Negativo inválido
					},
					createdAt: '2026-11-08T00:00:00.000Z',
					updatedAt: '2026-11-08T00:00:00.000Z'
				}
			]
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toContain('settings');
	});

	it('should reject duplicate portfolio IDs', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			portfolios: [
				{
					id: 'port-dup',
					name: 'Portafolio 1',
					settings: DEFAULT_SETTINGS_DTO,
					createdAt: '2026-11-08T00:00:00.000Z',
					updatedAt: '2026-11-08T00:00:00.000Z'
				},
				{
					id: 'port-dup',
					name: 'Portafolio 2',
					settings: DEFAULT_SETTINGS_DTO,
					createdAt: '2026-11-08T00:00:00.000Z',
					updatedAt: '2026-11-08T00:00:00.000Z'
				}
			]
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.field).toContain('id');
		expect(result.error.message).toContain('duplicado');
	});

	it('should fallback activePortfolioId to first portfolio when missing or invalid', () => {
		const result = BackupParser.parseBackup({
			...validBackup,
			activePortfolioId: 'non-existent-id'
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.activePortfolioId).toBe('port-1');
		expect(result.value.settings.activePortfolioId).toBe('port-1');
	});
});
