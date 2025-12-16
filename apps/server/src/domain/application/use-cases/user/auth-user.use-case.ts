import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { WrongCredentialsError } from 'apps/server/src/core/errors/wrong-credentials.error';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import { CreateAccessJwtPayload, CreateRefreshJwtPayload } from 'apps/server/src/core/types/auth';
import { inject, singleton } from 'tsyringe';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';

interface AuthenticateUserUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUserUseCaseResponse = Either<
  ResourceNotFoundError | WrongCredentialsError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@singleton()
export class AuthenticateUserUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) return fail(new ResourceNotFoundError('User was not found'));

    const isPasswordValid = await this.authService.validatePassword(password, user.password);

    if (!isPasswordValid) return fail(new WrongCredentialsError());

    const profile = await this.profileRepository.findByUserId(user.id.toString());

    if (!profile) return fail(new ResourceNotFoundError('Profile was not found'));

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) =>
          ({
            sub: id.toString(),
            name: user.name,
            email: user.email,
            accessLevel: profile.accessLevel,
            type: 'access',
          }) satisfies CreateAccessJwtPayload,
      }),
      this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) =>
          ({
            sub: id.toString(),
            accessLevel: profile.accessLevel,
            type: 'refresh',
          }) satisfies CreateRefreshJwtPayload,
        options: { expiresIn: '2h' },
      }),
    ]);

    return succeed({
      accessToken,
      refreshToken,
    });
  }
}
