import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { inject, singleton } from 'tsyringe';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import { NotAllowedError } from 'apps/server/src/core/errors/not-allowed.error';
import {
  PROFILE_REPOSITORY_TOKEN,
  IProfileRepository,
} from '../../repositories/profile.repository';

type VerifyCodeUseCaseRequest = {
  code: string;
  userId: string;
  tokenCode?: string;
};

type VerifyCodeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    authToken: string;
  }
>;

@singleton()
export class VerifyCodeUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    code,
    userId,
    tokenCode,
  }: VerifyCodeUseCaseRequest): Promise<VerifyCodeUseCaseResponse> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) return fail(new ResourceNotFoundError('user not found'));

      const profile = await this.profileRepository.findById(user.profile.id.toString());

      if (!profile) return fail(new ResourceNotFoundError('profile not found'));

      if (!tokenCode) return fail(new ResourceNotFoundError('token code not found'));

      if (code !== tokenCode) return fail(new NotAllowedError('code does not match'));

      const authToken = await this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) => ({
          sub: id.toString(),
          accessLevel: profile.accessLevel,
          type: 'pass_reset',
        }),
      });

      return succeed({ authToken });
    } catch (err) {
      return fail(new Error('Could not verify'));
    }
  }
}
