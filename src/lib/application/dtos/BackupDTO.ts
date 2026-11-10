import type { SettingsDTO } from './SettingsDTO';
import type { PortfolioDTO } from './PortfolioDTO';

export interface BackupDTO {
	readonly version: string;
	readonly app: string;
	readonly exportedAt: string;
	readonly activePortfolioId?: string;
	readonly settings: SettingsDTO;
	readonly portfolios: readonly PortfolioDTO[];
}

export const BACKUP_APP_NAME = 'InteresIt';
export const BACKUP_CURRENT_VERSION = '2.2.0';
