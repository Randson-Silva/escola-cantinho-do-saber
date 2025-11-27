import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { GetStudentsCountUseCase } from 'apps/server/src/domain/application/use-cases/student/get-students-count.use-case';

@injectable()
export class GetStudentsCountController {
  public readonly router: Router;

  constructor(private readonly getStudentsCountUseCase: GetStudentsCountUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/student/report/count',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(_req: Request, res: Response) {
    const result = await this.getStudentsCountUseCase.execute();

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

    const { count } = result.value;

    return res.status(200).json({ count });
  }
}
