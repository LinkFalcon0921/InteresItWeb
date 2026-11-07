import {
	err,
	ok,
	type Result
} from '$domain';
import type {
	ReportExportOptions,
	ReportExportPort,
	SimulationOutputDTO
} from '$application';

export class PrintExportAdapter implements ReportExportPort {
	constructor(private readonly windowRef?: Window) {}

	private getWindow(): Window | undefined {
		if (this.windowRef) {
			return this.windowRef;
		}
		if (typeof window !== 'undefined') {
			return window;
		}
		return undefined;
	}

	public async printReport(): Promise<Result<void, Error>> {
		const win = this.getWindow();
		if (!win) {
			return err(new Error('El objeto window no está disponible en este entorno.'));
		}

		try {
			win.print();
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async exportReport(
		data: SimulationOutputDTO,
		options?: ReportExportOptions
	): Promise<Result<void, Error>> {
		const win = this.getWindow();
		if (!win) {
			return err(new Error('El objeto window no está disponible en este entorno.'));
		}

		const originalTitle = win.document.title;
		try {
			if (options?.fileName && options.fileName.trim().length > 0) {
				win.document.title = options.fileName.trim();
			} else {
				const start = data.periodos.length > 0 ? (data.periodos[0]?.fechaInicio ?? 'inicio') : 'inicio';
				const lastPeriod =
					data.periodos.length > 0 ? data.periodos[data.periodos.length - 1] : undefined;
				const end = lastPeriod?.fechaCorte ?? 'fin';
				win.document.title = `InteresIt_Reporte_${start}_${end}`;
			}

			win.print();
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		} finally {
			win.document.title = originalTitle;
		}
	}
}
