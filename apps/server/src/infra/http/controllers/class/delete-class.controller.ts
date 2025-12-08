import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { DeleteClassUseCase } from 'apps/server/src/domain/application/use-cases/class/delete-class.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const deleteClassParamSchema = z.object({
  classId: z.string(),
});

type DeleteParamSchema = z.infer<typeof deleteClassParamSchema>;

@injectable()
export class DeleteClassController {
  public readonly router: Router;

  constructor(private readonly deleteClassUseCase: DeleteClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete('/class/:classId', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request<DeleteParamSchema>, res: Response) {
    const { classId } = req.params;

    const result = await this.deleteClassUseCase.execute({ classId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotDeleteError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json();
  }
}
