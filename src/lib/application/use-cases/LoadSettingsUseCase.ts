import type { Result } from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class LoadSettingsUseCase {
	constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

	public async execute(): Promise<Result<SettingsDTO, Error>> {
		return this.settingsRepository.loadSettings();
	}
}
