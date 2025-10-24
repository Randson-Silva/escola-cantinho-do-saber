import { IProfileRepository } from '../../repositories/profile.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ProfileEntity } from '../../../enterprise/entities/profile.entity';

type FindProfileByIdUseCaseRequest = {
  id: string;
};

type FindProfileByIdUseCaseResponse = Either<ResourceNotFoundError, { profile: ProfileEntity }>;

export class FindProfileByIdUseCase {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute({ id }: FindProfileByIdUseCaseRequest): Promise<FindProfileByIdUseCaseResponse> {
    try {
      const foundProfile = await this.profileRepository.findById(id);

      if (!foundProfile) return fail(new ResourceNotFoundError('Profile not found'));

      return succeed({ profile: foundProfile });
    } catch (error) {
      return fail(new Error('Profile was not found due to error: ' + error));
    }
  }
}
