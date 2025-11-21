import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { DeleteLessonUseCase } from 'apps/server/src/domain/application/use-cases/lesson/delete-lesson.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const deleteLessonParamSchema = z.object({
  id: z.string(),
});

type DeleteParamSchema = z.infer<typeof deleteLessonParamSchema>;

@injectable()
export class DeleteLessonController {
  public readonly router: Router;

  constructor(private readonly deleteLessonUseCase: DeleteLessonUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete(
      '/lessons/:id',
      checkJwt,
      this.handle.bind(this),
    );
  }

  async handle(req: Request<DeleteParamSchema>, res: Response) {
    const { id } = req.params;

    const result = await this.deleteLessonUseCase.execute({ lessonId: id });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotDeleteError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json();
  }
}
