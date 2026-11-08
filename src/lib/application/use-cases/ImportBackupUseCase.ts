import { BackupParser, err, ok, type Result } from '$domain';
import type { BackupDTO } from '../dtos/BackupDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class ImportBackupUseCase {
	constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

	public async execute(raw: unknown): Promise<Result<BackupDTO, Error>> {
		try {
			let parsedData: unknown = raw;
			if (typeof raw === 'string') {
				try {
					parsedData = JSON.parse(raw);
				} catch {
					return err(new Error('El archivo seleccionado no contiene una estructura JSON válida.'));
				}
			}

			const validationRes = BackupParser.parseBackup(parsedData);
			if (!validationRes.ok) {
				return err(new Error(`Copia de seguridad inválida: ${validationRes.error.message}`));
			}

			const backup = validationRes.value;

			// Persist each portfolio
			for (const portfolio of backup.portfolios) {
				const savePortRes = await this.settingsRepository.savePortfolio(portfolio);
				if (!savePortRes.ok) {
					return err(new Error(`Error al restaurar portafolio "${portfolio.name}": ${savePortRes.error.message}`));
				}
			}

			// Persist settings
			const saveSettingsRes = await this.settingsRepository.saveSettings(backup.settings);
			if (!saveSettingsRes.ok) {
				return err(new Error(`Error al restaurar configuración: ${saveSettingsRes.error.message}`));
			}

			return ok(backup);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
