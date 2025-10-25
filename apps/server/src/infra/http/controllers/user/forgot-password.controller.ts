import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { z } from 'zod';
import { Router, Request, Response } from 'express';
import { ForgotPasswordUseCase } from 'apps/server/src/domain/application/use-cases/user/forgot-password.use-case';

const forgotPasswordBodySchema = z.object({
  email: z.email().nonempty(),
});

const bodyValidationPipe = validateBody(forgotPasswordBodySchema);

type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordBodySchema>;

@injectable()
export class ForgotPasswordController {
  public readonly router: Router;

  constructor(private readonly forgotPassword: ForgotPasswordUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/forgot-password',
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as ForgotPasswordBodySchema;

    const { email } = body;

    const result = await this.forgotPassword.execute({
      email,
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

    const { authToken } = result.value;

    return res.status(200).json({ authToken });
  }
}
