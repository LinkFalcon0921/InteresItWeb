/**
 * Ventaja institucional comparativa del Escenario A frente al Escenario B en la matriz de pares.
 */
export enum ComparisonAdvantage {
	Positive = 'POSITIVE',
	Neutral = 'NEUTRAL',
	Negative = 'NEGATIVE'
}

/**
 * Contrato de interfaz para describir la evaluación de ventaja comparativa entre dos escenarios.
 */
export interface ComparisonAdvantageDetail {
	readonly advantage: ComparisonAdvantage;
	readonly label: string;
	readonly isFavorable: boolean;
}
