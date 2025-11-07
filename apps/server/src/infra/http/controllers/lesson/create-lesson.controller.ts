import { CreateLessonUseCase } from 'apps/server/src/domain/application/use-cases/lesson/create-lesson.use-case';
import { inject, singleton } from 'tsyringe';
import { Router, Request, Response } from 'express';
import {
  createLessonBodySchema,
  createLessonParamsSchema,
} from '../../../http-body-validator/lesson.validator';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';

@singleton()
export class CreateLessonController {
  public router: Router;

  constructor(
    @inject(CreateLessonUseCase)
    private readonly createLessonUseCase: CreateLessonUseCase,
  ) {
    this.router = Router();
    this.router.post('/classes/:classId/lessons', (req, res) =>
      this.handle(req, res),
    );
  }

  private async handle(req: Request, res: Response) {
    const paramsValidation = createLessonParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params (classId)' });
    }
    const { classId } = paramsValidation.data;

    const bodyValidation = createLessonBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).send({
        message: 'Invalid request body',
        errors: bodyValidation.error.format(),
      });
    }

    const result = await this.createLessonUseCase.execute({
      classId,
      ...bodyValidation.data,
    });

    if (result.isFail()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) {
        return res.status(404).send({ message: error.message });
      }
      return res.status(500).send({ message: 'Internal server error' });
    }

    return res.status(201).send(result.value);
  }
}
