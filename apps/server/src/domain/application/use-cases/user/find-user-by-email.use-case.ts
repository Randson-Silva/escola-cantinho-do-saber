import { Either, fail, succeed } from 'apps/server/src/core/either';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import { inject, singleton } from 'tsyringe';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

type FindUserByEmailUseCaseRequest = {
  userEmail: string;
};

type FindUserByEmailUseCaseResponse = Either<ResourceNotFoundError, { user: UserEntity }>;

@singleton()
export class FindUserByEmailUseCase {
  constructor(@inject(USERS_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository) {}

  async execute({
    userEmail,
  }: FindUserByEmailUseCaseRequest): Promise<FindUserByEmailUseCaseResponse> {
    try {
      const user = await this.userRepository.findByEmail(userEmail);

      if (!user) {
        return fail(new ResourceNotFoundError('User was not found'));
      }

      return succeed({ user });
    } catch (err) {
      return fail(new Error('Could not find user due to error: ' + err));
    }
  }
}
