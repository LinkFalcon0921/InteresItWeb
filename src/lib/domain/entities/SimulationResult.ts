import type { ScenarioRole } from '../enums/ScenarioRole';
import type { Money } from '../value-objects/Money';
import type { InflationRate } from '../value-objects/InflationRate';
import type { PeriodCalculation } from './PeriodCalculation';

export interface ScenarioSummary {
	readonly escenarioId: string;
	readonly nombre: string;
	readonly balanceFinal: Money;
	readonly balanceReal?: Money;
	readonly tasaRealAnual?: number;
	readonly interesTotalNeto: Money;
	readonly rendimientoNeto: Money;
	readonly rol: ScenarioRole;
}

export interface SimulationResult {
	readonly capitalInicial: Money;
	readonly aporteMensual: Money;
	readonly totalAportado: Money;
	readonly totalExtraordinario?: Money;
	readonly totalInvertido: Money;
	readonly tasaInflacion?: InflationRate;
	readonly periodos: readonly PeriodCalculation[];
	readonly resumenPorEscenario: readonly ScenarioSummary[];
	readonly escenarioLiderId: string;
	readonly ventajaLider: Money;
}
