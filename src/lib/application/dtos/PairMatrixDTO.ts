import type { ComparisonAdvantage } from '$domain';
import type { ScenarioSummaryDTO } from './SimulationOutputDTO';

export interface PairScenarioComparisonDTO {
	readonly escenarioA: ScenarioSummaryDTO;
	readonly escenarioB: ScenarioSummaryDTO;
	readonly diferenciaBalance: number;
	readonly diferenciaRendimiento: number;
	readonly favorecidoId: string;
	readonly ventajaA: ComparisonAdvantage;
}

export interface PairMatrixDTO {
	readonly comparaciones: readonly PairScenarioComparisonDTO[];
	readonly totalPares: number;
}
