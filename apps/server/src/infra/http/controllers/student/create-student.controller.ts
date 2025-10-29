import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateStudentUseCase } from 'apps/server/src/domain/application/use-cases/student/create-student.use-case';

const createStudentBodySchema = z.object({
  name: z.string().nonempty(),
  birthDate: z.iso.date(),
});

type CreateStudentBodySchema = z.infer<typeof createStudentBodySchema>;

const bodyValidationPipe = validateBody(createStudentBodySchema);

@injectable()
export class CreateStudentController {
  public readonly router: Router;

  constructor(private readonly createStudentUseCase: CreateStudentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/student',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateStudentBodySchema;

    const { birthDate, name } = body;

    const result = await this.createStudentUseCase.execute({
      birthDate: new Date(birthDate),
      name,
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

    const { studentId } = result.value;

    return res.status(200).json({ studentId });
  }
}
