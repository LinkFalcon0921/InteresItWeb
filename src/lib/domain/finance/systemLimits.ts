/**
 * Límites del sistema y constantes de dominio financiero inmutables.
 *
 * Congeladas con Object.freeze para impedir su modificación en tiempo
 * de ejecución, en el frontend o desde la consola del navegador.
 */
export const SYSTEM_LIMITS = Object.freeze({
	/** Máximo horizonte de proyección permitido en años */
	MAX_HORIZON_YEARS: 30,
	/** Máximo horizonte de proyección en días calendario (30 años con años bisiestos) */
	MAX_HORIZON_DAYS: 10958,
	/** Máximo número de periodos mensuales en simulación (30 años * 12 meses) */
	MAX_PERIODS: 360,
	/** Máximo número de portafolios guardados permitidos en el sistema */
	MAX_PORTFOLIOS: 50,
	/** Máximo número de escenarios de inversión simultáneos */
	MAX_SCENARIOS: 200,
	/** Mínimo número de escenarios requeridos para simulación comparativa */
	MIN_SCENARIOS: 2,
	/** Base de cálculo de días de acuerdo al estándar financiero ADR-004 */
	BASE_DAYS: 365,
	/** Tasa de retención fiscal ley República Dominicana (10% sobre rendimientos brutos) */
	TAX_RATE_RD: 0.10
} as const);

export type SystemLimits = typeof SYSTEM_LIMITS;
