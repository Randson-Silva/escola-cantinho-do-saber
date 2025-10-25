import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ResetPasswordUseCase } from 'apps/server/src/domain/application/use-cases/user/reset-password.use-case';
import { injectable } from 'tsyringe';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { Router, Response } from 'express';
import { checkJwt, IRequestWithUser } from '../../../auth/auth.middleware';
import { requireTokenType } from '../../../auth/token-type.middleware';

const resetPasswordBodySchema = z.object({
  newPassword: z.string().trim().nonempty().min(8),
});

const bodyValidationPipe = validateBody(resetPasswordBodySchema);

type resetPasswordBodySchema = z.infer<typeof resetPasswordBodySchema>;

@injectable()
export class ResetPasswordController {
  public readonly router: Router;

  constructor(private readonly resetPassword: ResetPasswordUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/reset-password',
      checkJwt,
      requireTokenType('pass_reset'),
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: IRequestWithUser, res: Response) {
    const userId = req.user?.sub;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const body = req.body as resetPasswordBodySchema;

    const { newPassword } = body;

    const result = await this.resetPassword.execute({
      newPassword,
      userId,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotUpdateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { userId: retrievedUserId } = result.value;

    return res.status(200).json({ userId: retrievedUserId });
  }
}
