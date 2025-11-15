import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateLessonUseCase } from 'apps/server/src/domain/application/use-cases/lesson/update-lesson.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const updateLessonParamSchema = z.object({
  id: z.string(),
});
type UpdateParamSchema = z.infer<typeof updateLessonParamSchema>;

const updateLessonBodySchema = z.object({
  lessonDate: z.coerce.date(),
  startTime: z.string().nullable().default(null),
  endTime: z.string().nullable().default(null),
  duration: z.string().nullable().default(null),
});
type UpdateLessonBodySchema = z.infer<typeof updateLessonBodySchema>;

const bodyValidationPipe = validateBody(updateLessonBodySchema);

@injectable()
export class UpdateLessonController {
  public readonly router: Router;

  constructor(private readonly updateLessonUseCase: UpdateLessonUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/lessons/:id',
      checkJwt,
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateLessonBodySchema;
    const { id } = req.params;

    const result = await this.updateLessonUseCase.execute({
      lessonId: id,
      lessonDate: body.lessonDate,
      startTime: body.startTime,
      endTime: body.endTime,
      duration: body.duration,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotUpdateError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { lessonId } = result.value;
    return res.status(200).json({ lessonId });
  }
}
