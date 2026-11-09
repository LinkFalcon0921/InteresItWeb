/**
 * Pestañas principales de navegación en la interfaz de la terminal financiera.
 */
export enum NavigationTab {
	Simulador = 'simulador',
	Comparativa = 'comparativa',
	Reporte = 'reporte'
}

/**
 * Contrato de interfaz para items descriptivos de pestañas de navegación.
 */
export interface NavigationTabOption {
	readonly id: NavigationTab;
	readonly label: string;
	readonly icon: string;
}
