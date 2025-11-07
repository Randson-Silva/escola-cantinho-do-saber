import { Either, fail, succeed } from 'apps/server/src/core/either';
import { IProfileRepository } from '../../repositories/profile.repository';
import { IUserRepository } from '../../repositories/user.repository';
import { ProfileEntity } from '../../../enterprise/entities/profile.entity';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

type FindProfileByUserIdUseCaseRequest = { userId: string };

type FindProfileByUserIdUseCaseResponse = Either<ResourceNotFoundError, { profile: ProfileEntity }>;

export class FindProfileByUserIdUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute({
    userId,
  }: FindProfileByUserIdUseCaseRequest): Promise<FindProfileByUserIdUseCaseResponse> {
    try {
      const foundUser = await this.userRepository.findById(userId);

      if (!foundUser) return fail(new ResourceNotFoundError('User not found'));

      const { profile } = foundUser;

      if (!profile.id) return fail(new ResourceNotFoundError('User does not have profileId'));

      const foundProfile = await this.profileRepository.findById(profile.id.toString());

      if (!foundProfile)
        return fail(
          new ResourceNotFoundError(
            `Profile was not found for user with email: ${foundUser.email}`,
          ),
        );

      return succeed({ profile: foundProfile });
    } catch (error) {
      return fail(new Error('Profile was not found due to error: ' + error));
    }
  }
}
