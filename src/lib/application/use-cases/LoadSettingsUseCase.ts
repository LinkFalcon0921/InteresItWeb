import { err, type Result } from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class LoadSettingsUseCase {
	constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

	public async execute(): Promise<Result<SettingsDTO, Error>> {
		try {
			return await this.settingsRepository.loadSettings();
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return err(error);
		}
	}
}
