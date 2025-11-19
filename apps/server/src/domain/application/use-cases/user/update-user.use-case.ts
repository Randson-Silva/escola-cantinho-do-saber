import { Either, fail, succeed } from 'apps/server/src/core/either';
import { UserEntity, UserProps } from 'apps/server/src/core/entities/user';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';
import { ProfileEntity, ProfileProps } from '../../../enterprise/entities/profile.entity';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { Optional } from 'apps/server/src/core/types/optional';
import { inject, singleton } from 'tsyringe';

type UpdateUserUseCaseRequest = Optional<
  Omit<UserProps, 'profileId'> & ProfileProps & { userId: string },
  'password' | 'email' | 'accessLevel' | 'name'
>;

type UpdateUserUseCaseResponse = Either<CannotUpdateError, { userId: string }>;

@singleton()
export class UpdateUserUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    userId,
    accessLevel,
    email,
    name,
    password,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    try {
      const foundUser = await this.userRepository.findById(userId);

      if (!foundUser) return fail(new ResourceNotFoundError('User not found'));

      let hashedPassword = foundUser.password;
      if (password) {
        hashedPassword = await this.authService.hashPassword(password);
        console.log(`Hashed: ${hashedPassword}`);
      }

      const foundProfile = await this.profileRepository.findById(foundUser.profile.id.toString());

      if (!foundProfile)
        return fail(new ResourceNotFoundError(`Profile not found to user: ${userId}`));

      const profile = ProfileEntity.create(
        { accessLevel: accessLevel ?? foundProfile.accessLevel },
        foundProfile.id,
      );

      const canUpdateProfile = await this.profileRepository.update(profile);

      if (!canUpdateProfile) return fail(new CannotUpdateError('Profile'));

      // Mantém o mesmo ID do usuário encontrado para que o repository.update encontre o registro correto
      const user = UserEntity.create(
        {
          email: email ?? foundUser.email,
          name: name ?? foundUser.name,
          password: hashedPassword,
          profile: profile,
        },
        foundUser.id,
      );

      const canUpdateUser = await this.userRepository.update(user);

      if (!canUpdateUser) return fail(new CannotUpdateError('User'));

      return succeed({ userId: user.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update user due to error' + error));
    }
  }
}
