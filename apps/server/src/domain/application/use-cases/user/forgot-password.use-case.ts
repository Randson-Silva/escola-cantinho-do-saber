import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { inject, singleton } from 'tsyringe';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';
import { NodeMailerService } from 'apps/server/src/infra/nodemailer/nodemailer.service';
import { error } from 'console';
import { CreateAuthJwtPayload } from 'apps/server/src/core/types/auth';

type ForgotPasswordUseCaseRequest = {
  email: string;
};

type ForgotPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    authToken: string;
  }
>;

@singleton()
export class ForgotPasswordUseCase {
  constructor(
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
    private readonly nodeMailerService: NodeMailerService,
  ) {}

  async execute({ email }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) return fail(new ResourceNotFoundError(' user not found'));

      const profile = await this.profileRepository.findById(user.profile.id.toString());

      if (!profile) return fail(new ResourceNotFoundError('profile was not found'));

      const code = this.authService.generateVerificationCode();

      await this.nodeMailerService.sendMail({
        to: email,
        text: `${code}`,
      });

      const authToken = await this.authService.generateToken({
        payloadSource: user,
        payloadGenerator: ({ id }) =>
          ({
            sub: id.toString(),
            code,
            accessLevel: profile.accessLevel,
            type: 'pass_reset',
          }) satisfies CreateAuthJwtPayload,
      });

      return succeed({ authToken });
    } catch (err) {
      return fail(new Error('Cannot update user due to error' + error));
    }
  }
}
