import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { NotAllowedError } from 'apps/server/src/core/errors/not-allowed.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { VerifyCodeUseCase } from 'apps/server/src/domain/application/use-cases/user/verify-code.use-case';
import { injectable } from 'tsyringe';
import { Response, Router } from 'express';
import { checkJwt, IRequestWithUser } from '../../../auth/auth.middleware';

const verifyCodeBodySchema = z.object({
  code: z.string(),
});

const bodyValidationPipe = validateBody(verifyCodeBodySchema);

type VerifyCodeBodySchema = z.infer<typeof verifyCodeBodySchema>;

@injectable()
export class VerifyCodeController {
  public readonly router: Router;

  constructor(private readonly verifyCode: VerifyCodeUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/verify-code',
      bodyValidationPipe,
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: IRequestWithUser, res: Response) {
    const { user } = req;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { sub: userId, code: tokenCode } = user;

    const body = req.body as VerifyCodeBodySchema;

    const { code } = body;

    const result = await this.verifyCode.execute({
      code,
      userId,
      tokenCode,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case NotAllowedError:
          return res.status(405).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { authToken } = result.value;

    return res.status(200).json({ authToken });
  }
}
