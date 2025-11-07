import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { inject, singleton } from 'tsyringe';

type DeleteUserUseCaseRequest = {
  userId: string;
};

type DeleteUserUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

@singleton()
export class DeleteUserUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute({ userId }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const foundUser = await this.userRepository.findById(userId);

    if (!foundUser) return fail(new ResourceNotFoundError('User not found'));

    const { profile } = foundUser;

    const foundProfile = await this.profileRepository.findById(profile.id.toString());

    if (!foundProfile) return fail(new ResourceNotFoundError('Profile not found'));

    const userWasDeleted = await this.userRepository.delete(userId);

    if (!userWasDeleted) return fail(new CannotDeleteError('User'));

    return succeed(null);
  }
}
