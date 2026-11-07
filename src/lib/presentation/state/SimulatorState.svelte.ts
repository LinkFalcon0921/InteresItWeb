import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	DEFAULT_SETTINGS_DTO,
	LoadSettingsUseCase,
	SaveSettingsUseCase,
	type InvestmentSettingDTO,
	type PairMatrixDTO,
	type ReportExportOptions,
	type ReportExportPort,
	type SettingsDTO,
	type SimulationInputDTO,
	type SimulationOutputDTO
} from '$application';

export class SimulatorState {
	public montoInicial = $state<number>(185);
	public aporteMensual = $state<number>(0);
	public fechaInicio = $state<string>('2026-04-17');
	public fechaFin = $state<string>('2026-11-16');
	public diaCorte = $state<number>(16);
	public omitirPrimerCorte = $state<boolean>(false);
	public aplicarImpuesto = $state<boolean>(true);
	public isDarkMode = $state<boolean>(false);
	public inversiones = $state<InvestmentSettingDTO[]>([
		{ id: 'inv-1', nombre: 'Escenario 1', tasaAnual: 10, color: 'emerald' },
		{ id: 'inv-2', nombre: 'Escenario 2', tasaAnual: 12, color: 'blue' }
	]);

	public activeTab = $state<'simulador' | 'comparativa' | 'reporte'>('simulador');
	public isDrawerOpen = $state<boolean>(false);
	public errorMessage = $state<string>('');
	public isLoading = $state<boolean>(false);
	public saveNotificationVisible = $state<boolean>(false);

	constructor(
		private readonly calculateSimulation: CalculateSimulationUseCase,
		private readonly calculatePairMatrix: CalculatePairMatrixUseCase,
		private readonly loadSettingsUseCase: LoadSettingsUseCase,
		private readonly saveSettingsUseCase: SaveSettingsUseCase,
		private readonly reportExportPort: ReportExportPort
	) {}

	public simulationResult = $derived.by<SimulationOutputDTO | null>(() => {
		const input: SimulationInputDTO = {
			capitalInicial: this.montoInicial,
			aporteMensual: this.aporteMensual,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			diaCorte: this.diaCorte,
			omitirPrimerCorte: this.omitirPrimerCorte,
			aplicarImpuestoRD: this.aplicarImpuesto,
			escenarios: this.inversiones.map((inv) => ({
				id: inv.id,
				nombre: inv.nombre,
				tasaAnual: inv.tasaAnual,
				color: inv.color
			}))
		};

		const result = this.calculateSimulation.execute(input);
		if (result.ok) {
			this.errorMessage = '';
			return result.value;
		} else {
			this.errorMessage = result.error.message;
			return null;
		}
	});

	public pairMatrixResult = $derived.by<PairMatrixDTO | null>(() => {
		const summaries = this.simulationResult?.resumenPorEscenario;
		if (!summaries || summaries.length === 0) {
			return null;
		}
		const result = this.calculatePairMatrix.execute(summaries);
		return result.ok ? result.value : null;
	});

	public escenarioLider = $derived.by(() => {
		const leaderId = this.simulationResult?.escenarioLiderId;
		if (!leaderId || !this.simulationResult) return null;
		const summary = this.simulationResult.resumenPorEscenario.find(
			(s) => s.escenarioId === leaderId
		);
		const setting = this.inversiones.find((i) => i.id === leaderId);
		return summary && setting ? { summary, setting } : null;
	});

	public adjustMontoInicial(delta: number): void {
		const next = Math.max(0, this.montoInicial + delta);
		this.montoInicial = next;
	}

	public adjustAporteMensual(delta: number): void {
		const next = Math.max(0, this.aporteMensual + delta);
		this.aporteMensual = next;
	}

	public setHorizonMonths(months: number): void {
		const startDate = new Date(this.fechaInicio + 'T00:00:00');
		if (Number.isNaN(startDate.getTime())) return;

		const target = new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate());
		const y = target.getFullYear();
		const m = String(target.getMonth() + 1).padStart(2, '0');
		const d = String(target.getDate()).padStart(2, '0');
		this.fechaFin = `${y}-${m}-${d}`;
	}

	public addInversion(nombre?: string, tasaAnual?: number): void {
		if (this.inversiones.length >= 20) return;
		const nextIdx = this.inversiones.length + 1;
		const colorPalette = ['emerald', 'blue', 'cyan', 'amber', 'purple', 'rose', 'teal', 'indigo'];
		const nextColor = colorPalette[(nextIdx - 1) % colorPalette.length] ?? 'teal';

		this.inversiones = [
			...this.inversiones,
			{
				id: `inv-${Date.now()}-${nextIdx}`,
				nombre: nombre ?? `Escenario ${nextIdx}`,
				tasaAnual: tasaAnual ?? 10,
				color: nextColor
			}
		];
	}

	public removeInversion(id: string): void {
		if (this.inversiones.length <= 2) return;
		this.inversiones = this.inversiones.filter((inv) => inv.id !== id);
	}

	public updateInversionTasa(id: string, tasa: number): void {
		this.inversiones = this.inversiones.map((inv) =>
			inv.id === id ? { ...inv, tasaAnual: Math.max(0, tasa) } : inv
		);
	}

	public updateInversionNombre(id: string, nombre: string): void {
		this.inversiones = this.inversiones.map((inv) =>
			inv.id === id ? { ...inv, nombre } : inv
		);
	}

	public async loadFromStorage(): Promise<void> {
		this.isLoading = true;
		try {
			const result = await this.loadSettingsUseCase.execute();
			const settings = result.ok ? result.value : DEFAULT_SETTINGS_DTO;
			this.applySettings(settings);
		} finally {
			this.isLoading = false;
		}
	}

	public async saveToStorage(): Promise<boolean> {
		const settings: SettingsDTO = {
			id: 'current',
			montoInicial: this.montoInicial,
			aporteMensual: this.aporteMensual,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			diaCorte: this.diaCorte,
			omitirPrimerCorte: this.omitirPrimerCorte,
			aplicarImpuesto: this.aplicarImpuesto,
			isDarkMode: this.isDarkMode,
			inversiones: this.inversiones
		};

		const result = await this.saveSettingsUseCase.execute(settings);
		if (result.ok) {
			this.saveNotificationVisible = true;
			return true;
		} else {
			this.errorMessage = result.error.message;
			return false;
		}
	}

	public async exportPDF(fileName?: string): Promise<boolean> {
		if (!this.simulationResult) return false;
		const options: ReportExportOptions | undefined = fileName ? { fileName } : undefined;
		const result = await this.reportExportPort.exportReport(this.simulationResult, options);
		return result.ok;
	}

	public async printReport(): Promise<boolean> {
		const result = await this.reportExportPort.printReport();
		return result.ok;
	}

	public toggleTheme(): void {
		this.isDarkMode = !this.isDarkMode;
		if (typeof document !== 'undefined') {
			if (this.isDarkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}

	private applySettings(settings: SettingsDTO): void {
		this.montoInicial = settings.montoInicial;
		this.aporteMensual = settings.aporteMensual;
		this.fechaInicio = settings.fechaInicio;
		this.fechaFin = settings.fechaFin;
		this.diaCorte = settings.diaCorte;
		this.omitirPrimerCorte = settings.omitirPrimerCorte;
		this.aplicarImpuesto = settings.aplicarImpuesto;
		this.isDarkMode = settings.isDarkMode;
		this.inversiones = settings.inversiones.map((inv) => ({ ...inv }));

		if (typeof document !== 'undefined') {
			if (this.isDarkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}
