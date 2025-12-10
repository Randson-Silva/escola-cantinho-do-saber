import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateStudentUseCase } from 'apps/server/src/domain/application/use-cases/student/update-student.use-case';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

const updateStudentParamSchema = z.object({
  studentId: z.string(),
});

type UpdateParamSchema = z.infer<typeof updateStudentParamSchema>;

const updateStudentBodySchema = z.object({
  name: z.string().nonempty().optional(),
  birthDate: z
    .string()
    .transform((val) => {
      const [day, month, year] = val.split('/');

      const date = new Date(`${year}-${month}-${day}T00:00:00`);

      if (isNaN(date.getTime())) {
        throw new Error('Formato inválido, esperado: DD/MM/YYYY');
      }

      return date;
    })
    .optional(),
  classId: z.string().optional(),
  currentGrade: z.enum(SchoolGrade).optional(), // Permitir atualização de série
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
    this.router.put('/student/:studentId', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateStudentBodySchema;
    const { studentId } = req.params;

    // Passar todos os campos opcionais
    const { name, birthDate, classId, currentGrade } = body;

    const result = await this.updateStudentUseCase.execute({
      studentId,
      name,
      birthDate,
      classId,
      currentGrade,
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
