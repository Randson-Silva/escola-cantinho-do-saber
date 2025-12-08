import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateClassUseCase } from 'apps/server/src/domain/application/use-cases/class/create-class.use-case';
import { SchoolGrade, Shift } from 'apps/server/src/core/types/school-enums';

const createClassBodySchema = z.object({
  name: z.string(),
  teacherId: z.string(),
  shift: z.enum(Shift),
  grades: z.array(z.enum(SchoolGrade)),
});

type CreateClassBodySchema = z.infer<typeof createClassBodySchema>;

const bodyValidationPipe = validateBody(createClassBodySchema);

@injectable()
export class CreateClassController {
  public readonly router: Router;

  constructor(private readonly createClassUseCase: CreateClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/class', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateClassBodySchema;

    const { name, teacherId, shift, grades } = body;

    const result = await this.createClassUseCase.execute({
      name,
      teacherId,
      shift,
      grades,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { classId } = result.value;

    return res.status(201).json({ classId });
  }
}
