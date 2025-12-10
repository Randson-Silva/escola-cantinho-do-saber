import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { CreateTeacherUseCase } from 'apps/server/src/domain/application/use-cases/teacher/create-teacher.use-case';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware'; // Ajuste requireRole se necessário
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

const createTeacherBodySchema = z.object({
  name: z.string().min(3),
  taxId: z.string().min(11),
  phone: z.string().min(8),
  email: z.email(),
  pixKey: z.string().min(1),
  startDate: z.string().transform((val) => {
    const [day, month, year] = val.split('/');

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date.getTime())) {
      throw new Error('Formato inválido, esperado: DD/MM/YYYY');
    }

    return date;
  }),
  expertise: z.string().optional(),
  qualifiedGrades: z.array(z.enum(SchoolGrade)).min(1),
});

type CreateTeacherBodySchema = z.infer<typeof createTeacherBodySchema>;

const bodyValidationPipe = validateBody(createTeacherBodySchema);

@injectable()
export class CreateTeacherController {
  public readonly router: Router;

  constructor(
    @inject(CreateTeacherUseCase)
    private readonly createTeacherUseCase: CreateTeacherUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/teachers',
      checkJwt,
      requireAnyRole(['ADMIN']), // Ajuste conforme sua auth
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateTeacherBodySchema;

    const result = await this.createTeacherUseCase.execute({
      name: body.name,
      taxId: body.taxId,
      phone: body.phone,
      email: body.email,
      pixKey: body.pixKey,
      startDate: body.startDate,
      expertise: body.expertise,
      qualifiedGrades: body.qualifiedGrades,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case AlreadyExistsError:
          return res.status(409).json({ message });
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { teacherId, userEmail, password } = result.value;
    return res.status(201).json({ teacherId, userEmail, password });
  }
}
