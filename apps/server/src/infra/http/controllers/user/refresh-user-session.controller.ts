import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { Request, Router, Response } from 'express';
import { injectable } from 'tsyringe';
import { RefreshUserSessionUseCase } from 'apps/server/src/domain/application/use-cases/user/refresh-user-session.use-case';

const refreshUserSessionBodySchema = z.object({
  refreshToken: z.string(),
});

const bodyValidationPipe = validateBody(refreshUserSessionBodySchema);

type RefreshUserSessionBodySchema = z.infer<typeof refreshUserSessionBodySchema>;

@injectable()
export class RefreshUserSessionController {
  public readonly router: Router;

  constructor(private readonly refreshUserSession: RefreshUserSessionUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/refresh',
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const { refreshToken: reqRefreshToken } = req.body as RefreshUserSessionBodySchema;

    const result = await this.refreshUserSession.execute({
      refreshToken: reqRefreshToken,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { accessToken, refreshToken } = result.value;

    return res.status(200).json({ accessToken, refreshToken });
  }
}
