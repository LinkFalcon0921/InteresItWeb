import type { SettingsDTO } from './SettingsDTO';

export interface PortfolioSummaryDTO {
	readonly id: string;
	readonly name: string;
	readonly updatedAt: string;
	readonly escenariosCount: number;
	readonly montoInicial: number;
}

export interface PortfolioDTO {
	readonly id: string;
	readonly name: string;
	readonly settings: SettingsDTO;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export const DEFAULT_PORTFOLIO_ID = 'default-portfolio';
export const DEFAULT_PORTFOLIO_NAME = 'Portafolio Principal';
