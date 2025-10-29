import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateStudentUseCase } from 'apps/server/src/domain/application/use-cases/student/update-student.use-case';

const updateStudentParamSchema = z.object({
  studentId: z.string(),
});

type UpdateParamSchema = z.infer<typeof updateStudentParamSchema>;

const updateStudentBodySchema = z.object({
  name: z.string().nonempty(),
  birthDate: z.iso.date(),
});

type UpdateStudentBodySchema = z.infer<typeof updateStudentBodySchema>;

const bodyValidationPipe = validateBody(updateStudentBodySchema);

@injectable()
export class UpdateStudentController {
  public readonly router: Router;

  constructor(private readonly updateStudentUseCase: UpdateStudentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/student/:studentId',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateStudentBodySchema;

    const { birthDate, name } = body;

    const { studentId } = req.params;

    const result = await this.updateStudentUseCase.execute({
      studentId,
      birthDate: new Date(birthDate),
      name,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotUpdateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { studentId: retrievedId } = result.value;

    return res.status(200).json({ studentId: retrievedId });
  }
}
