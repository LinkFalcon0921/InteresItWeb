import type { Result } from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';
import type { PortfolioDTO, PortfolioSummaryDTO } from '../dtos/PortfolioDTO';

export interface SettingsRepositoryPort {
	loadSettings(): Promise<Result<SettingsDTO, Error>>;
	saveSettings(settings: SettingsDTO): Promise<Result<void, Error>>;
	listPortfolios(): Promise<Result<PortfolioSummaryDTO[], Error>>;
	loadPortfolio(id: string): Promise<Result<PortfolioDTO, Error>>;
	savePortfolio(portfolio: PortfolioDTO): Promise<Result<void, Error>>;
	deletePortfolio(id: string): Promise<Result<void, Error>>;
	isTutorialCompleted(): Promise<Result<boolean, Error>>;
	setTutorialCompleted(completed: boolean): Promise<Result<void, Error>>;
}
