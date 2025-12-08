import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindClassByIdUseCase } from 'apps/server/src/domain/application/use-cases/class/find-class-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ClassPresenter } from '../../presenters/class.presenter';

const findClassByIdParamSchema = z.object({
  classId: z.string(),
});

type FindParamSchema = z.infer<typeof findClassByIdParamSchema>;

@injectable()
export class FindClassByIdController {
  public readonly router: Router;

  constructor(private readonly findClassByIdClassUseCase: FindClassByIdUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/class/:classId', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request<FindParamSchema>, res: Response) {
    const { classId } = req.params;

    const result = await this.findClassByIdClassUseCase.execute({ classId });

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

    const { classEntity } = result.value;

    return res.status(200).json(ClassPresenter.toHTTP(classEntity));
  }
}
