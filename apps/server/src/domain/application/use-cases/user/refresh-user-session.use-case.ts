import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { RefreshJwtPayload, CreateAccessJwtPayload } from 'apps/server/src/core/types/auth';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { inject, singleton } from 'tsyringe';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';

interface RefreshUserSessionUseCaseRequest {
  refreshToken: string;
}

type RefreshUserSessionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@singleton()
export class RefreshUserSessionUseCase {
  constructor(
    private readonly authService: AuthService,
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute({
    refreshToken,
  }: RefreshUserSessionUseCaseRequest): Promise<RefreshUserSessionUseCaseResponse> {
    try {
      const { sub } = await this.authService.verifyToken<RefreshJwtPayload>(refreshToken);

      const user = await this.userRepository.findById(sub);

      if (!user) return fail(new ResourceNotFoundError('user does not exist'));

      const profile = await this.profileRepository.findById(user.profile.id.toString());

      if (!profile) return fail(new ResourceNotFoundError('profile does not exist'));

      const accessToken = await this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) =>
          ({
            sub: id.toString(),
            name: user.name,
            email: user.email,
            accessLevel: profile.accessLevel,
            type: 'access',
          }) satisfies CreateAccessJwtPayload,
        options: { expiresIn: '24h' },
      });

      const newRefreshToken = await this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) =>
          ({
            sub: id.toString(),
            name: user.name,
            email: user.email,
            accessLevel: profile.accessLevel,
            type: 'refresh',
          }) satisfies CreateAccessJwtPayload,
        options: { expiresIn: '7d' },
      });

      return succeed({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return fail(new Error('Could not refresh user session'));
    }
  }
}
