import { Router, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt, IRequestWithUser } from '../../../auth/auth.middleware';
import { FindUserByIdUseCase } from 'apps/server/src/domain/application/use-cases/user/find-user-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { UserPresenter } from '../../presenters/user.presenter';

@injectable()
export class SelfFindUserController {
  public readonly router: Router;

  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/users/profile',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: IRequestWithUser, res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await this.findUserByIdUseCase.execute({
      userId: user.sub,
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

    const { user: userData } = result.value;

    return res.status(200).json(UserPresenter.toHTTP(userData));
  }
}
