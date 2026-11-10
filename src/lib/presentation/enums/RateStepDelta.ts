/**
 * Incrementos y decrementos discretos de tasa de interés para ajustes rápidos en tarjetas de escenarios.
 */
export enum RateStepDelta {
	DecreaseHalf = -0.5,
	DecreaseQuarter = -0.25,
	IncreaseQuarter = 0.25,
	IncreaseHalf = 0.5
}

/**
 * Contrato de interfaz para acciones de ajuste de tasa con descripción de accesibilidad.
 */
export interface RateStepDeltaAction {
	readonly delta: RateStepDelta;
	readonly label: string;
	readonly ariaLabel: string;
}
