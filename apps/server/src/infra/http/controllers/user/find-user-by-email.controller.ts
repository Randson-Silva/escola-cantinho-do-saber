import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { injectable } from 'tsyringe';
import { checkJwt, requireRole } from '../../../auth/auth.middleware';
import { FindUserByEmailUseCase } from 'apps/server/src/domain/application/use-cases/user/find-user-by-email.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { FindAllUsersUseCase } from 'apps/server/src/domain/application/use-cases/user/find-all-users.use-case';
import { UserPresenter } from '../../presenters/user.presenter';

const findUserByEmailQuerySchema = z.object({
  email: z.email().optional(),
});

type FindUserByEmailQuerySchema = z.infer<typeof findUserByEmailQuerySchema>;

const bodyValidationPipe = validateBody(findUserByEmailQuerySchema);

@injectable()
export class FindUserByEmailController {
  public readonly router: Router;

  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly findUsersUseCase: FindAllUsersUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/users',
      checkJwt,
      requireRole('ADMIN'),
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<{}, {}, {}, FindUserByEmailQuerySchema>, res: Response) {
    const { email } = req.query;

    if (!email) {
      const result = await this.findUsersUseCase.execute();

      if (result.isFail()) {
        const exception = result.value;
        const message = exception.message;

        switch (exception.constructor) {
          default:
            return res.status(500).json(message);
        }
      }

      const { users } = result.value;

      return res.status(200).json(users.map(UserPresenter.toHTTP));
    }

    const result = await this.findUserByEmailUseCase.execute({
      userEmail: email,
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

    const { user } = result.value;

    return res.status(200).json(UserPresenter.toHTTP(user));
  }
}
