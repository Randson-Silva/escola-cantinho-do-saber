import { Either, fail, succeed } from 'apps/server/src/core/either';
import { UserEntity, UserProps } from 'apps/server/src/core/entities/user';
import { IUserRepository } from '../../repositories/user.repository';
import { IProfileRepository } from '../../repositories/profile.repository';
import { ProfileEntity, ProfileProps } from '../../../enterprise/entities/profile.entity';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { Optional } from 'apps/server/src/core/types/optional';

type UpdateUserUseCaseRequest = Optional<
  Omit<UserProps, 'profileId'> & ProfileProps & { userId: string },
  'password' | 'email' | 'accessLevel' | 'name'
>;

type UpdateUserUseCaseResponse = Either<CannotUpdateError, { userId: string }>;

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
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

      const foundProfile = await this.profileRepository.findById(foundUser.profileId);

      if (!foundProfile)
        return fail(new ResourceNotFoundError(`Profile not found to user: ${userId}`));

      const profile = ProfileEntity.create(
        { accessLevel: accessLevel ?? foundProfile.accessLevel },
        foundProfile.id,
      );

      const canUpdateProfile = await this.profileRepository.update(profile);

      if (!canUpdateProfile) return fail(new CannotUpdateError('Profile'));

      const user = UserEntity.create({
        email: email ?? foundUser.email,
        name: name ?? foundUser.name,
        password: hashedPassword,
        profileId: profile.id.toString(),
      });

      const canUpdateUser = await this.userRepository.update(user);

      if (!canUpdateUser) return fail(new CannotUpdateError('User'));

      return succeed({ userId: user.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update user due to error' + error));
    }
  }
}
