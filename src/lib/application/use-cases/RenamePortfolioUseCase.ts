import { err, ok, type Result } from '$domain';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class RenamePortfolioUseCase {
	constructor(private readonly repository: SettingsRepositoryPort) {}

	public async execute(id: string, newName: string): Promise<Result<void, Error>> {
		if (!id || id.trim().length === 0) {
			return err(new Error('El identificador del portafolio no puede estar vacío.'));
		}

		if (!newName || newName.trim().length === 0) {
			return err(new Error('El nuevo nombre del portafolio no puede estar vacío.'));
		}

		if (newName.trim().length > 100) {
			return err(new Error('El nombre del portafolio no puede exceder 100 caracteres.'));
		}

		try {
			const loadResult = await this.repository.loadPortfolio(id.trim());
			if (!loadResult.ok) {
				return err(loadResult.error);
			}

			const existing = loadResult.value;
			const updated = {
				...existing,
				name: newName.trim(),
				updatedAt: new Date().toISOString()
			};

			return await this.repository.savePortfolio(updated);
		} catch (error) {
			const errObj = error instanceof Error ? error : new Error(String(error));
			return err(errObj);
		}
	}
}
