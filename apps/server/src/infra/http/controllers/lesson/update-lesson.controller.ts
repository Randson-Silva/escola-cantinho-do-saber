import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateLessonUseCase } from 'apps/server/src/domain/application/use-cases/lesson/update-lesson.use-case';

const updateLessonParamSchema = z.object({
  lessonId: z.string().min(1),
});

type UpdateParamSchema = z.infer<typeof updateLessonParamSchema>;

const updateLessonBodySchema = z.object({
  date: z.string().transform((val) => {
    const [day, month, year] = val.split('/');

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date.getTime())) {
      throw new Error('Formato inválido, esperado: DD/MM/YYYY');
    }

    return date;
  }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().optional(),
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
    this.router.put('/lessons/:lessonId', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const paramsValidation = updateLessonParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid lessonId' });
    }
    const { lessonId } = paramsValidation.data;

    const { date, duration, endTime, startTime } = req.body as UpdateLessonBodySchema;

    const result = await this.updateLessonUseCase.execute({
      lessonId,
      date,
      startTime,
      endTime,
      duration,
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

    const { lessonId: resultLessonId } = result.value;
    return res.status(200).json({ lessonId: resultLessonId });
  }
}
