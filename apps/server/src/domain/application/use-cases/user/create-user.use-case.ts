import { Either, fail, succeed } from 'apps/server/src/core/either';
import { UserEntity, UserProps } from 'apps/server/src/core/entities/user';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';
import { ProfileEntity, ProfileProps } from '../../../enterprise/entities/profile.entity';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';

type CreateUserUseCaseRequest = Omit<UserProps, 'profile' | 'createdAt' | 'deletedAt'> &
  ProfileProps;

type CreateUserUseCaseResponse = Either<CannotCreateError, { userId: string }>;

@singleton()
export class CreateUserUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    email,
    name,
    password,
    accessLevel,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    try {
      const hashedPassword = await this.authService.hashPassword(password);
      console.log(`Hashed: ${hashedPassword}`);

      const profile = ProfileEntity.create({ accessLevel });

      const canCreateProfile = await this.profileRepository.create(profile);

      if (!canCreateProfile) return fail(new CannotCreateError('Profile'));

      const user = UserEntity.create({
        email,
        name,
        password: hashedPassword,
        profile: profile,
      });

      const canCreateUser = await this.userRepository.create(user);

      if (!canCreateUser) return fail(new CannotCreateError('User'));

      return succeed({ userId: user.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create user due to error' + error));
    }
  }
}
