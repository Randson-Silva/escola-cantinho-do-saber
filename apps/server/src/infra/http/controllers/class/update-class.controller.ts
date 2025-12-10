import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateClassUseCase } from 'apps/server/src/domain/application/use-cases/class/update-class.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { SchoolGrade, Shift } from 'apps/server/src/core/types/school-enums';

const updateClassParamSchema = z.object({
  classId: z.string(),
});

type UpdateParamSchema = z.infer<typeof updateClassParamSchema>;

// Schema correto baseado na Entidade
const updateClassBodySchema = z.object({
  name: z.string(),
  teacherId: z.string(),
  shift: z.enum(Shift),
  grades: z.array(z.enum(SchoolGrade)),
});

type UpdateClassBodySchema = z.infer<typeof updateClassBodySchema>;

const bodyValidationPipe = validateBody(updateClassBodySchema);

@injectable()
export class UpdateClassController {
  public readonly router: Router;

  constructor(private readonly updateClassUseCase: UpdateClassUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put('/class/:classId', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateClassBodySchema;
    const { classId } = req.params;

    const { name, teacherId, shift, grades } = body;

    const result = await this.updateClassUseCase.execute({
      classId,
      name,
      teacherId,
      shift,
      grades,
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

    const { classId: retrievedId } = result.value;

    return res.status(200).json({ classId: retrievedId });
  }
}
