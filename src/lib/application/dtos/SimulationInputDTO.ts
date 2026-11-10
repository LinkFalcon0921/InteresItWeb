import type { AporteExtraordinarioDTO } from './AporteExtraordinarioDTO';

export interface ScenarioInputDTO {
	readonly id: string;
	readonly nombre: string;
	readonly tasaAnual: number;
	readonly color: string;
}

export interface SimulationInputDTO {
	readonly capitalInicial: number;
	readonly aporteMensual: number;
	readonly fechaInicio: string;
	readonly fechaFin: string;
	readonly diaCorte: number;
	readonly omitirPrimerCorte?: boolean;
	readonly aplicarImpuestoRD?: boolean;
	readonly tasaInflacion?: number;
	readonly aportesExtraordinarios?: readonly AporteExtraordinarioDTO[];
	readonly escenarios: readonly ScenarioInputDTO[];
}
