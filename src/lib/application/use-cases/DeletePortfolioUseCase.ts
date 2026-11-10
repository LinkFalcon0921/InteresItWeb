import { err, ok, type Result } from '$domain';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class DeletePortfolioUseCase {
	constructor(private readonly repository: SettingsRepositoryPort) {}

	public async execute(id: string): Promise<Result<void, Error>> {
		if (!id || id.trim().length === 0) {
			return err(new Error('El identificador del portafolio no puede estar vacío.'));
		}

		try {
			// Verificar que no sea el único portafolio
			const listResult = await this.repository.listPortfolios();
			if (listResult.ok && listResult.value.length <= 1) {
				return err(new Error('No es posible eliminar el único portafolio existente. Debe haber al menos un portafolio.'));
			}

			return await this.repository.deletePortfolio(id.trim());
		} catch (error) {
			const errObj = error instanceof Error ? error : new Error(String(error));
			return err(errObj);
		}
	}
}
