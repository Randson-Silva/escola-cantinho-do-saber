import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindLessonByIdUseCase } from 'apps/server/src/domain/application/use-cases/lesson/find-lesson-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { LessonPresenter } from '../../presenters/lesson.presenter';

const findLessonByIdParamSchema = z.object({
  id: z.string(),
});

type FindParamSchema = z.infer<typeof findLessonByIdParamSchema>;

@injectable()
export class FindLessonByIdController {
  public readonly router: Router;

  constructor(
    private readonly findLessonByIdUseCase: FindLessonByIdUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/lessons/:id',
      checkJwt,
      this.handle.bind(this),
    );
  }

  async handle(req: Request<FindParamSchema>, res: Response) {
    const { id } = req.params;

    const result = await this.findLessonByIdUseCase.execute({ lessonId: id });

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

    const { lesson } = result.value;

    return res.status(200).json(LessonPresenter.toHTTP(lesson));
  }
}
