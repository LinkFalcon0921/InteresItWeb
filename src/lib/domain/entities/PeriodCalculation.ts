import type { CalendarDate } from '../value-objects/CalendarDate';
import type { Money } from '../value-objects/Money';

export interface ScenarioPeriodResult {
	readonly escenarioId: string;
	readonly balanceAnterior: Money;
	readonly interesBruto: Money;
	readonly interesNeto: Money;
	readonly aporte: Money;
	readonly aporteExtraordinario?: Money;
	readonly balanceFinal: Money;
	readonly balanceReal?: Money;
	readonly isSkipped: boolean;
}

export interface PeriodCalculation {
	readonly periodoIndex: number;
	readonly fechaInicio: CalendarDate;
	readonly fechaCorte: CalendarDate;
	readonly diasPeriodo: number;
	readonly etiquetaMes: string;
	readonly resultadosPorEscenario: readonly ScenarioPeriodResult[];
}
