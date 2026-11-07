import type { ScenarioRole } from '$domain';

export interface ScenarioPeriodResultDTO {
	readonly escenarioId: string;
	readonly balanceAnterior: number;
	readonly interesBruto: number;
	readonly interesNeto: number;
	readonly aporte: number;
	readonly balanceFinal: number;
	readonly isSkipped: boolean;
}

export interface PeriodCalculationDTO {
	readonly periodoIndex: number;
	readonly fechaInicio: string;
	readonly fechaCorte: string;
	readonly diasPeriodo: number;
	readonly etiquetaMes: string;
	readonly resultadosPorEscenario: readonly ScenarioPeriodResultDTO[];
}

export interface ScenarioSummaryDTO {
	readonly escenarioId: string;
	readonly nombre: string;
	readonly balanceFinal: number;
	readonly interesTotalNeto: number;
	readonly rendimientoNeto: number;
	readonly rol: ScenarioRole;
}

export interface SimulationOutputDTO {
	readonly capitalInicial: number;
	readonly aporteMensual: number;
	readonly totalAportado: number;
	readonly totalInvertido: number;
	readonly periodos: readonly PeriodCalculationDTO[];
	readonly resumenPorEscenario: readonly ScenarioSummaryDTO[];
	readonly escenarioLiderId: string;
	readonly ventajaLider: number;
}
