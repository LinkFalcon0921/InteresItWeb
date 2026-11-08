import type {
	PortfolioDTO,
	PortfolioSummaryDTO,
	SettingsDTO,
	SettingsRepositoryPort
} from '$application';
import { DEFAULT_SETTINGS_DTO } from '$application';
import { err, ok, type Result } from '$domain';

export class FakeSettingsRepository implements SettingsRepositoryPort {
	public storedSettings: SettingsDTO | null = null;
	public portfolios: PortfolioDTO[] = [];
	public tutorialCompleted = false;

	public shouldFailLoadSettings = false;
	public shouldFailSaveSettings = false;
	public shouldFailListPortfolios = false;
	public shouldFailLoadPortfolio = false;
	public shouldFailSavePortfolio = false;
	public shouldFailDeletePortfolio = false;
	public shouldFailTutorial = false;
	public shouldThrowOnLoad = false;
	public shouldThrowOnSave = false;

	public error: Error = new Error('Database connection failed');

	public get customError(): Error {
		return this.error;
	}

	public set customError(val: Error) {
		this.error = val;
	}

	public get shouldFailLoad(): boolean {
		return this.shouldFailLoadSettings;
	}

	public set shouldFailLoad(val: boolean) {
		this.shouldFailLoadSettings = val;
	}

	public get shouldFailSave(): boolean {
		return this.shouldFailSaveSettings;
	}

	public set shouldFailSave(val: boolean) {
		this.shouldFailSaveSettings = val;
	}

	public get shouldFail(): boolean {
		return this.shouldFailLoadSettings;
	}

	public set shouldFail(value: boolean) {
		this.shouldFailLoadSettings = value;
		this.shouldFailSaveSettings = value;
		this.shouldFailListPortfolios = value;
		this.shouldFailLoadPortfolio = value;
		this.shouldFailSavePortfolio = value;
		this.shouldFailDeletePortfolio = value;
		this.shouldFailTutorial = value;
	}

	public async loadSettings(): Promise<Result<SettingsDTO, Error>> {
		if (this.shouldThrowOnLoad) {
			throw new Error('Catastrophic DB crash on load');
		}
		if (this.shouldFailLoadSettings) {
			return err(this.error);
		}
		return ok(this.storedSettings ?? DEFAULT_SETTINGS_DTO);
	}

	public async saveSettings(settings: SettingsDTO): Promise<Result<void, Error>> {
		if (this.shouldThrowOnSave) {
			throw new Error('Catastrophic DB crash on save');
		}
		if (this.shouldFailSaveSettings) {
			return err(this.error);
		}
		this.storedSettings = settings;
		return ok(undefined);
	}

	public async listPortfolios(): Promise<Result<PortfolioSummaryDTO[], Error>> {
		if (this.shouldFailListPortfolios) {
			return err(this.error);
		}
		const summaries: PortfolioSummaryDTO[] = this.portfolios.map((p) => ({
			id: p.id,
			name: p.name,
			updatedAt: p.updatedAt,
			escenariosCount: p.settings.inversiones.length,
			montoInicial: p.settings.montoInicial
		}));
		return ok(summaries);
	}

	public async loadPortfolio(id: string): Promise<Result<PortfolioDTO, Error>> {
		if (this.shouldFailLoadPortfolio) {
			return err(this.error);
		}
		const match = this.portfolios.find((p) => p.id === id);
		if (!match) {
			return err(new Error(`Portafolio ${id} no encontrado`));
		}
		return ok(match);
	}

	public async savePortfolio(portfolio: PortfolioDTO): Promise<Result<void, Error>> {
		if (this.shouldFailSavePortfolio) {
			return err(this.error);
		}
		const idx = this.portfolios.findIndex((p) => p.id === portfolio.id);
		if (idx >= 0) {
			this.portfolios[idx] = portfolio;
		} else {
			this.portfolios.push(portfolio);
		}
		return ok(undefined);
	}

	public async deletePortfolio(id: string): Promise<Result<void, Error>> {
		if (this.shouldFailDeletePortfolio) {
			return err(this.error);
		}
		this.portfolios = this.portfolios.filter((p) => p.id !== id);
		return ok(undefined);
	}

	public async isTutorialCompleted(): Promise<Result<boolean, Error>> {
		if (this.shouldFailTutorial) {
			return err(this.error);
		}
		return ok(this.tutorialCompleted);
	}

	public async setTutorialCompleted(completed: boolean): Promise<Result<void, Error>> {
		if (this.shouldFailTutorial) {
			return err(this.error);
		}
		this.tutorialCompleted = completed;
		return ok(undefined);
	}
}
