import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	DEFAULT_PORTFOLIO_ID,
	DEFAULT_PORTFOLIO_NAME,
	DEFAULT_SETTINGS_DTO,
	DeletePortfolioUseCase,
	ExportBackupUseCase,
	ImportBackupUseCase,
	ListPortfoliosUseCase,
	LoadPortfolioUseCase,
	LoadSettingsUseCase,
	RenamePortfolioUseCase,
	SavePortfolioUseCase,
	SaveSettingsUseCase,
	type InvestmentSettingDTO,
	type PairMatrixDTO,
	type PortfolioDTO,
	type PortfolioSummaryDTO,
	type ReportExportOptions,
	type ReportExportPort,
	type SettingsDTO,
	type SimulationInputDTO,
	type SimulationOutputDTO
} from '$application';
import { generateProjectionCSV } from '$domain';

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
	private _customErrorMessage = $state<string>('');
	public isLoading = $state<boolean>(false);
	public saveNotificationVisible = $state<boolean>(false);

	public currentPortfolioId = $state<string>(DEFAULT_PORTFOLIO_ID);
	public currentPortfolioName = $state<string>(DEFAULT_PORTFOLIO_NAME);
	public portfolios = $state<PortfolioSummaryDTO[]>([]);
	public isPortfolioDialogOpen = $state<boolean>(false);
	public isDiagnosticsDialogOpen = $state<boolean>(false);
	public isExportDialogOpen = $state<boolean>(false);

	constructor(
		private readonly calculateSimulation: CalculateSimulationUseCase,
		private readonly calculatePairMatrix: CalculatePairMatrixUseCase,
		private readonly loadSettingsUseCase: LoadSettingsUseCase,
		private readonly saveSettingsUseCase: SaveSettingsUseCase,
		private readonly reportExportPort: ReportExportPort,
		private readonly listPortfoliosUseCase?: ListPortfoliosUseCase,
		private readonly loadPortfolioUseCase?: LoadPortfolioUseCase,
		private readonly savePortfolioUseCase?: SavePortfolioUseCase,
		private readonly deletePortfolioUseCase?: DeletePortfolioUseCase,
		private readonly renamePortfolioUseCase?: RenamePortfolioUseCase,
		private readonly exportBackupUseCase?: ExportBackupUseCase,
		private readonly importBackupUseCase?: ImportBackupUseCase
	) {}

	private calculationExecution = $derived.by(() => {
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

		return this.calculateSimulation.execute(input);
	});

	public simulationResult = $derived<SimulationOutputDTO | null>(
		this.calculationExecution.ok ? this.calculationExecution.value : null
	);

	public get errorMessage(): string {
		if (this._customErrorMessage) return this._customErrorMessage;
		return this.calculationExecution.ok ? '' : this.calculationExecution.error.message;
	}

	public set errorMessage(value: string) {
		this._customErrorMessage = value;
	}

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
			if (settings.activePortfolioId) {
				this.currentPortfolioId = settings.activePortfolioId;
			}
			await this.refreshPortfolios();
			const activeMatch = this.portfolios.find((p) => p.id === this.currentPortfolioId);
			if (activeMatch) {
				this.currentPortfolioName = activeMatch.name;
			} else {
				const first = this.portfolios[0];
				if (first) {
					this.currentPortfolioId = first.id;
					this.currentPortfolioName = first.name;
				}
			}
		} finally {
			this.isLoading = false;
		}
	}

	private getCleanInversiones(): InvestmentSettingDTO[] {
		return this.inversiones.map((inv) => ({
			id: inv.id,
			nombre: inv.nombre,
			tasaAnual: inv.tasaAnual,
			color: inv.color
		}));
	}

	public async saveToStorage(): Promise<boolean> {
		const settings: SettingsDTO = {
			id: 'current',
			activePortfolioId: this.currentPortfolioId,
			montoInicial: this.montoInicial,
			aporteMensual: this.aporteMensual,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			diaCorte: this.diaCorte,
			omitirPrimerCorte: this.omitirPrimerCorte,
			aplicarImpuesto: this.aplicarImpuesto,
			isDarkMode: this.isDarkMode,
			inversiones: this.getCleanInversiones()
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

	public async refreshPortfolios(): Promise<void> {
		if (!this.listPortfoliosUseCase) return;
		const result = await this.listPortfoliosUseCase.execute();
		if (result.ok) {
			this.portfolios = result.value;
		}
	}

	public async switchPortfolio(id: string): Promise<boolean> {
		if (!this.loadPortfolioUseCase) return false;
		this.isLoading = true;
		try {
			const result = await this.loadPortfolioUseCase.execute(id);
			if (result.ok) {
				const portfolio = result.value;
				this.currentPortfolioId = portfolio.id;
				this.currentPortfolioName = portfolio.name;
				this.applySettings(portfolio.settings);
				await this.saveToStorage();
				await this.refreshPortfolios();
				return true;
			} else {
				this.errorMessage = result.error.message;
				return false;
			}
		} finally {
			this.isLoading = false;
		}
	}

	public async saveCurrentPortfolio(customName?: string): Promise<boolean> {
		if (!this.savePortfolioUseCase) {
			return await this.saveToStorage();
		}
		const nameToUse = customName?.trim() || this.currentPortfolioName;
		const settings: SettingsDTO = {
			id: this.currentPortfolioId,
			montoInicial: this.montoInicial,
			aporteMensual: this.aporteMensual,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			diaCorte: this.diaCorte,
			omitirPrimerCorte: this.omitirPrimerCorte,
			aplicarImpuesto: this.aplicarImpuesto,
			isDarkMode: this.isDarkMode,
			inversiones: this.getCleanInversiones()
		};

		const portfolio: PortfolioDTO = {
			id: this.currentPortfolioId,
			name: nameToUse,
			settings,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const result = await this.savePortfolioUseCase.execute(portfolio);
		if (result.ok) {
			this.currentPortfolioName = nameToUse;
			this.saveNotificationVisible = true;
			await this.saveToStorage();
			await this.refreshPortfolios();
			return true;
		} else {
			this.errorMessage = result.error.message;
			return false;
		}
	}

	public async createPortfolio(name: string): Promise<boolean> {
		if (!this.savePortfolioUseCase) return false;
		const trimmedName = name.trim();
		if (!trimmedName) {
			this.errorMessage = 'El nombre del nuevo portafolio no puede estar vacío.';
			return false;
		}

		const newId = `portfolio-${Date.now()}`;
		const settings: SettingsDTO = {
			id: newId,
			montoInicial: this.montoInicial,
			aporteMensual: this.aporteMensual,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			diaCorte: this.diaCorte,
			omitirPrimerCorte: this.omitirPrimerCorte,
			aplicarImpuesto: this.aplicarImpuesto,
			isDarkMode: this.isDarkMode,
			inversiones: this.getCleanInversiones()
		};

		const newPortfolio: PortfolioDTO = {
			id: newId,
			name: trimmedName,
			settings,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const result = await this.savePortfolioUseCase.execute(newPortfolio);
		if (result.ok) {
			this.currentPortfolioId = newId;
			this.currentPortfolioName = trimmedName;
			this.saveNotificationVisible = true;
			await this.saveToStorage();
			await this.refreshPortfolios();
			return true;
		} else {
			this.errorMessage = result.error.message;
			return false;
		}
	}

	public async renamePortfolio(id: string, newName: string): Promise<boolean> {
		if (!this.renamePortfolioUseCase) return false;
		const trimmed = newName.trim();
		if (!trimmed) {
			this.errorMessage = 'El nuevo nombre no puede estar vacío.';
			return false;
		}

		const result = await this.renamePortfolioUseCase.execute(id, trimmed);
		if (result.ok) {
			if (id === this.currentPortfolioId) {
				this.currentPortfolioName = trimmed;
			}
			await this.refreshPortfolios();
			return true;
		} else {
			this.errorMessage = result.error.message;
			return false;
		}
	}

	public async deletePortfolio(id: string): Promise<boolean> {
		if (!this.deletePortfolioUseCase) return false;
		const result = await this.deletePortfolioUseCase.execute(id);
		if (result.ok) {
			await this.refreshPortfolios();
			if (id === this.currentPortfolioId) {
				const fallback = this.portfolios[0];
				if (fallback) {
					await this.switchPortfolio(fallback.id);
				}
			}
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

	public exportCSV(scenarioId?: string, fileName?: string): boolean {
		if (!this.simulationResult) return false;
		const csvContent = generateProjectionCSV(this.simulationResult, {
			scenarioId: scenarioId === 'all' ? 'all' : scenarioId,
			includeScenarioColumn: scenarioId === 'all'
		});

		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			const cleanName = fileName?.trim()
				? fileName.trim()
				: `InteresIt_Proyeccion_${this.fechaInicio}_${this.fechaFin}`;
			link.setAttribute('download', cleanName.endsWith('.csv') ? cleanName : `${cleanName}.csv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setTimeout(() => URL.revokeObjectURL(url), 10000);
			return true;
		}
		return false;
	}

	public async exportBackup(): Promise<string | null> {
		if (!this.exportBackupUseCase) return null;
		const result = await this.exportBackupUseCase.execute();
		if (!result.ok) {
			this.errorMessage = result.error.message;
			return null;
		}
		const jsonStr = JSON.stringify(result.value, null, 2);
		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			const dateTag = new Date().toISOString().split('T')[0];
			link.setAttribute('download', `interesit_backup_${dateTag}.json`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setTimeout(() => URL.revokeObjectURL(url), 10000);
		}
		return jsonStr;
	}

	public async importBackup(rawJson: unknown): Promise<boolean> {
		if (!this.importBackupUseCase) return false;
		this.isLoading = true;
		this.errorMessage = '';
		const result = await this.importBackupUseCase.execute(rawJson);
		this.isLoading = false;
		if (result.ok) {
			await this.loadFromStorage();
			return true;
		} else {
			this.errorMessage = result.error.message;
			return false;
		}
	}

	public async printReport(): Promise<boolean> {
		const result = await this.reportExportPort.printReport();
		return result.ok;
	}

	public async resetToSafeDefaults(): Promise<void> {
		this.errorMessage = '';
		this.applySettings(DEFAULT_SETTINGS_DTO);
		await this.saveCurrentPortfolio();
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
