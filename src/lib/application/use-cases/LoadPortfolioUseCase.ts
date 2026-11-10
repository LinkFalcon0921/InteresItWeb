import { err, ok, type Result } from '$domain';
import type { PortfolioDTO } from '../dtos/PortfolioDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class LoadPortfolioUseCase {
	constructor(private readonly repository: SettingsRepositoryPort) {}

	public async execute(id: string): Promise<Result<PortfolioDTO, Error>> {
		if (!id || id.trim().length === 0) {
			return err(new Error('El identificador del portafolio no puede estar vacío.'));
		}

		try {
			return await this.repository.loadPortfolio(id.trim());
		} catch (error) {
			const errObj = error instanceof Error ? error : new Error(String(error));
			return err(errObj);
		}
	}
}
