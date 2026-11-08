export interface AporteExtraordinarioDTO {
	readonly id: string;
	readonly monto: number;
	readonly fecha: string;
	readonly descripcion?: string;
}
