/**
 * Puntos de interrupción (*breakpoints*) estandarizados para diseño responsivo adaptativo M3.
 */
export enum ResponsiveBreakpoint {
	Desktop = 1024,
	TabletLandscape = 1024,
	TabletPortrait = 768,
	FoldableUnfolded = 700,
	FoldableFolded = 400
}

/**
 * Contrato de interfaz para configuración de media queries y umbrales de visualización.
 */
export interface ResponsiveBreakpointConfig {
	readonly breakpoint: ResponsiveBreakpoint;
	readonly minWidthPx: number;
	readonly label: string;
}
