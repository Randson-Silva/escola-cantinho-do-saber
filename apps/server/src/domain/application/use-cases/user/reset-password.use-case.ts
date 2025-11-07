import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { inject, singleton } from 'tsyringe';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';

type ResetPasswordUseCaseRequest = {
  userId: string;
  newPassword: string;
};

type ResetPasswordUseCaseResponse = Either<
  ResourceNotFoundError | CannotUpdateError,
  {
    userId: string;
  }
>;

@singleton()
export class ResetPasswordUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    userId,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    try {
      const foundUser = await this.userRepository.findById(userId);

      if (!foundUser) return fail(new ResourceNotFoundError('user not found'));

      const hashedPassword = await this.authService.hashPassword(newPassword);

      const newUser = UserEntity.create(
        {
          email: foundUser.email,
          name: foundUser.name,
          profile: foundUser.profile,
          password: hashedPassword,
        },
        new UniqueEntityId(userId),
      );

      const canUpdate = await this.userRepository.update(newUser);

      if (!canUpdate) return fail(new CannotUpdateError('unable to update user'));

      return succeed({ userId: foundUser.id.toString() });
    } catch (err) {
      return fail(new Error('Cannot reset password due to error: ' + err));
    }
  }
}
