import { err, ok, type Result } from '$domain';
import type { PortfolioSummaryDTO } from '../dtos/PortfolioDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class ListPortfoliosUseCase {
	constructor(private readonly repository: SettingsRepositoryPort) {}

	public async execute(): Promise<Result<PortfolioSummaryDTO[], Error>> {
		try {
			return await this.repository.listPortfolios();
		} catch (error) {
			const errObj = error instanceof Error ? error : new Error(String(error));
			return err(errObj);
		}
	}
}
