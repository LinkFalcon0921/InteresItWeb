export interface InvestmentSettingDTO {
	readonly id: string;
	readonly nombre: string;
	readonly tasaAnual: number;
	readonly color: string;
}

export interface SettingsDTO {
	readonly id?: string;
	readonly activePortfolioId?: string;
	readonly montoInicial: number;
	readonly aporteMensual: number;
	readonly inversiones: readonly InvestmentSettingDTO[];
	readonly fechaInicio: string;
	readonly fechaFin: string;
	readonly diaCorte: number;
	readonly omitirPrimerCorte: boolean;
	readonly aplicarImpuesto: boolean;
	readonly isDarkMode: boolean;
}

export const DEFAULT_SETTINGS_DTO: SettingsDTO = {
	id: 'current',
	montoInicial: 185,
	aporteMensual: 0,
	inversiones: [
		{ id: 'inv-1', nombre: 'Escenario 1', tasaAnual: 10, color: 'emerald' },
		{ id: 'inv-2', nombre: 'Escenario 2', tasaAnual: 12, color: 'blue' }
	],
	fechaInicio: '2026-04-17',
	fechaFin: '2026-11-16',
	diaCorte: 16,
	omitirPrimerCorte: false,
	aplicarImpuesto: true,
	isDarkMode: false
};
