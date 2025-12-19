import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { FindTeachersUseCase } from 'apps/server/src/domain/application/use-cases/teacher/find-teachers.use-case'; // Import corrigido
import { TeacherPresenter } from '../../presenters/teacher.presenter';
// import { TeacherPresenter } from '../../presenters/teacher.presenter';

const querySchema = z.object({
  page: z.coerce.number().optional().default(1),
  query: z.string().optional(),
  status: z.string().optional(),
});

@injectable()
export class FindTeachersController {
  public readonly router: Router;

  constructor(@inject(FindTeachersUseCase) private findTeachersUseCase: FindTeachersUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/teachers',
      checkJwt,
      requireAnyRole(['ADMIN', 'COMUM', 'PROFESSOR']),
      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const queryValidation = querySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ message: 'Invalid query params' });
    }
    const { page, query, status } = queryValidation.data;

    const result = await this.findTeachersUseCase.execute({ page, query, status });

    if (result.isFail()) return res.status(500).json({ message: 'Error findTeachersing teachers' });

    const { teachers } = result.value;

    return res.status(200).json({ teachers: teachers.map(TeacherPresenter.toHTTP) });
  }
}
