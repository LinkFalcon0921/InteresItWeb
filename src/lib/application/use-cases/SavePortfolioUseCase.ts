import { err, ok, SYSTEM_LIMITS, type Result } from '$domain';
import type { PortfolioDTO } from '../dtos/PortfolioDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class SavePortfolioUseCase {
	constructor(private readonly repository: SettingsRepositoryPort) {}

	public async execute(portfolio: PortfolioDTO): Promise<Result<void, Error>> {
		if (!portfolio.id || portfolio.id.trim().length === 0) {
			return err(new Error('El identificador del portafolio no puede estar vacío.'));
		}

		if (!portfolio.name || portfolio.name.trim().length === 0) {
			return err(new Error('El nombre del portafolio no puede estar vacío.'));
		}

		if (portfolio.name.trim().length > 100) {
			return err(new Error('El nombre del portafolio no puede exceder 100 caracteres.'));
		}

		if (!portfolio.settings) {
			return err(new Error('La configuración del portafolio es requerida.'));
		}

		try {
			const listResult = await this.repository.listPortfolios();
			if (listResult.ok) {
				const isExisting = listResult.value.some((p) => p.id === portfolio.id.trim());
				if (!isExisting && listResult.value.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS) {
					return err(new Error(`Límite alcanzado: no se pueden almacenar más de ${SYSTEM_LIMITS.MAX_PORTFOLIOS} portafolios en el sistema.`));
				}
			}

			const sanitizedPortfolio: PortfolioDTO = {
				...portfolio,
				id: portfolio.id.trim(),
				name: portfolio.name.trim(),
				updatedAt: new Date().toISOString()
			};

			return await this.repository.savePortfolio(sanitizedPortfolio);
		} catch (error) {
			const errObj = error instanceof Error ? error : new Error(String(error));
			return err(errObj);
		}
	}
}
