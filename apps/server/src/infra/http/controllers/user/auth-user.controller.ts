import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { WrongCredentialsError } from 'apps/server/src/core/errors/wrong-credentials.error';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { AuthenticateUserUseCase } from 'apps/server/src/domain/application/use-cases/user/auth-user.use-case';
import { injectable } from 'tsyringe';

const authenticateUserBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

const bodyValidationPipe = validateBody(authenticateUserBodySchema);

type AuthenticateUserBodySchema = z.infer<typeof authenticateUserBodySchema>;

@injectable()
export class AuthenticateUserController {
  public readonly router: Router;

  constructor(private readonly authenticateUserUseCase: AuthenticateUserUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/login',
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as AuthenticateUserBodySchema;
    const { email, password } = body;

    const result = await this.authenticateUserUseCase.execute({
      email,
      password,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(400).json({ message });
        case WrongCredentialsError:
          return res.status(401).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { accessToken, refreshToken } = result.value;

    return res.status(200).json({ accessToken, refreshToken });
  }
}
