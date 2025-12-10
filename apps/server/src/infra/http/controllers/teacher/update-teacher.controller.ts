import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { UpdateTeacherUseCase } from 'apps/server/src/domain/application/use-cases/teacher/update-teacher.use-case';

const editBodySchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  pixKey: z.string().optional(),
  expertise: z.string().optional(),
  status: z.string().optional(),
  qualifiedGrades: z.array(z.enum(SchoolGrade)).optional(),
});

type EditBody = z.infer<typeof editBodySchema>;
const bodyValidation = validateBody(editBodySchema);

@injectable()
export class UpdateTeacherController {
  public readonly router: Router;

  constructor(
    @inject(UpdateTeacherUseCase)
    private updateTeacherUseCase: UpdateTeacherUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/teachers/:id',
      checkJwt,
      requireAnyRole(['ADMIN']),
      bodyValidation,
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const body = req.body as EditBody;

    const result = await this.updateTeacherUseCase.execute({ teacherId: id, ...body });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotUpdateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json(result.value);
  }
}
