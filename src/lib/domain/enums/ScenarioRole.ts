/**
 * Rol competitivo asignado a un escenario en el contexto de una simulación multiescenario.
 */
export enum ScenarioRole {
	Leader = 'LEADER',
	Challenger = 'CHALLENGER',
	Neutral = 'NEUTRAL'
}

/**
 * Contrato de interfaz para describir las propiedades y etiquetas visuales de un rol competitivo.
 */
export interface ScenarioRoleDetail {
	readonly role: ScenarioRole;
	readonly label: string;
	readonly badgeClass: string;
}
