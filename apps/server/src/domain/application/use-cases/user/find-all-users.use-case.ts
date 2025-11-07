import { Either, succeed, fail } from 'apps/server/src/core/either';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import { inject, singleton } from 'tsyringe';

type FindAllUsersUseCaseResponse = Either<Error, { users: UserEntity[] }>;

@singleton()
export class FindAllUsersUseCase {
  constructor(@inject(USERS_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository) {}

  async execute(): Promise<FindAllUsersUseCaseResponse> {
    try {
      const users = await this.userRepository.findAllUsers();

      return succeed({ users });
    } catch (err) {
      return fail(new Error('Could not fetch users'));
    }
  }
}
