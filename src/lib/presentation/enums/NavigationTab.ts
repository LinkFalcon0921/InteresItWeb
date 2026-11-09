export const NavigationTab = {
	Simulador: 'simulador',
	Comparativa: 'comparativa',
	Reporte: 'reporte'
} as const;

export type NavigationTab = (typeof NavigationTab)[keyof typeof NavigationTab];
