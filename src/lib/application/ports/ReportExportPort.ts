import type { Result } from '$domain';
import type { SimulationOutputDTO } from '../dtos/SimulationOutputDTO';

export interface ReportExportOptions {
	readonly fileName?: string;
	readonly orientation?: 'portrait' | 'landscape';
}

export interface ReportExportPort {
	exportReport(data: SimulationOutputDTO, options?: ReportExportOptions): Promise<Result<void, Error>>;
	printReport(): Promise<Result<void, Error>>;
}
