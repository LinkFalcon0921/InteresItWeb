import type { ScenarioRole } from '../enums/ScenarioRole';
import type { Money } from '../value-objects/Money';
import type { PeriodCalculation } from './PeriodCalculation';

export interface ScenarioSummary {
	readonly escenarioId: string;
	readonly nombre: string;
	readonly balanceFinal: Money;
	readonly interesTotalNeto: Money;
	readonly rendimientoNeto: Money;
	readonly rol: ScenarioRole;
}

export interface SimulationResult {
	readonly capitalInicial: Money;
	readonly aporteMensual: Money;
	readonly totalAportado: Money;
	readonly totalInvertido: Money;
	readonly periodos: readonly PeriodCalculation[];
	readonly resumenPorEscenario: readonly ScenarioSummary[];
	readonly escenarioLiderId: string;
	readonly ventajaLider: Money;
}
