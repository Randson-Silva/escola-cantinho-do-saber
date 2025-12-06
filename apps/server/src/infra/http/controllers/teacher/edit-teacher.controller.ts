import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { EditTeacherUseCase } from 'apps/server/src/domain/application/use-cases/teacher/edit-teacher.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const editBodySchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  pixKey: z.string().optional(),
  expertise: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  seriesIds: z.array(z.string()).optional(),
});

type EditBody = z.infer<typeof editBodySchema>;
const bodyValidation = validateBody(editBodySchema);

@injectable()
export class EditTeacherController {
  public readonly router: Router;

  constructor(@inject(EditTeacherUseCase) private editUseCase: EditTeacherUseCase) {
    this.router = Router();
    this.router.put('/teachers/:id', checkJwt, bodyValidation, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const body = req.body as EditBody;

    const result = await this.editUseCase.execute({ teacherId: id, ...body });

    if (result.isFail()) {
      if (result.value instanceof ResourceNotFoundError) return res.status(404).json({ message: 'Teacher not found' });
      return res.status(500).json({ message: 'Internal error' });
    }

    return res.status(200).json(result.value);
  }
}
