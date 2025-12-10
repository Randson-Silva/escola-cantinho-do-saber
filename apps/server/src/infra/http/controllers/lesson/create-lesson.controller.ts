import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { injectable } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { CreateLessonUseCase } from 'apps/server/src/domain/application/use-cases/lesson/create-lesson.use-case';

const createLessonParamSchema = z.object({
  classId: z.string().min(1),
});

// Regex para HH:mm
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const createLessonBodySchema = z.object({
  date: z.string().transform((val) => {
    const [day, month, year] = val.split('/');

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date.getTime())) {
      throw new Error('Formato inválido, esperado: DD/MM/YYYY');
    }

    return date;
  }),
  startTime: z.string().regex(timeFormatRegex, 'Invalid time format (HH:mm)'),
  durationStr: z.string().regex(timeFormatRegex, 'Invalid duration format (HH:mm)'),
});

type CreateLessonBodySchema = z.infer<typeof createLessonBodySchema>;

const bodyValidationPipe = validateBody(createLessonBodySchema);

@injectable()
export class CreateLessonController {
  public readonly router: Router;

  constructor(private readonly createLessonUseCase: CreateLessonUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/classes/:classId/lessons',
      checkJwt,
      requireAnyRole(['ADMIN', 'PROFESSOR']),
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const paramsValidation = createLessonParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid classId' });
    }
    const { classId } = paramsValidation.data;

    const { date, startTime, durationStr } = req.body as CreateLessonBodySchema;

    const result = await this.createLessonUseCase.execute({
      classId,
      date,
      startTime,
      durationStr,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { lessonId } = result.value;
    return res.status(201).json({ lessonId });
  }
}
