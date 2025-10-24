import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { IUserRepository } from '../../repositories/user.repository';
import { IProfileRepository } from '../../repositories/profile.repository';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';

type DeleteUserUseCaseRequest = {
  userId: string;
};

type DeleteUserUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute({ userId }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const foundUser = await this.userRepository.findById(userId);

    if (!foundUser) return fail(new ResourceNotFoundError('User not found'));

    const { profileId } = foundUser;

    const foundProfile = await this.profileRepository.findById(profileId);

    if (!foundProfile) return fail(new ResourceNotFoundError('Profile not found'));

    const profileWasDeleted = await this.profileRepository.delete(userId);

    if (!profileWasDeleted) return fail(new CannotDeleteError('Profile'));

    const userWasDeleted = await this.userRepository.delete(userId);

    if (!userWasDeleted) return fail(new CannotDeleteError('User'));

    return succeed(null);
  }
}
