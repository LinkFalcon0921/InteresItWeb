import { err, ok, type Result } from '$domain';
import {
	BACKUP_APP_NAME,
	BACKUP_CURRENT_VERSION,
	type BackupDTO
} from '../dtos/BackupDTO';
import type { PortfolioDTO } from '../dtos/PortfolioDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class ExportBackupUseCase {
	constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

	public async execute(): Promise<Result<BackupDTO, Error>> {
		try {
			const settingsRes = await this.settingsRepository.loadSettings();
			if (!settingsRes.ok) {
				return err(settingsRes.error);
			}
			const currentSettings = settingsRes.value;

			const summariesRes = await this.settingsRepository.listPortfolios();
			if (!summariesRes.ok) {
				return err(summariesRes.error);
			}
			const summaries = summariesRes.value;

			const fullPortfolios: PortfolioDTO[] = [];
			for (const summary of summaries) {
				const portRes = await this.settingsRepository.loadPortfolio(summary.id);
				if (portRes.ok) {
					fullPortfolios.push(portRes.value);
				}
			}

			const backup: BackupDTO = {
				version: BACKUP_CURRENT_VERSION,
				app: BACKUP_APP_NAME,
				exportedAt: new Date().toISOString(),
				activePortfolioId: currentSettings.activePortfolioId ?? fullPortfolios[0]?.id,
				settings: currentSettings,
				portfolios: fullPortfolios
			};

			return ok(backup);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
