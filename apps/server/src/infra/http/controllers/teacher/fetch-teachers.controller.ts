import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FetchTeachersUseCase } from 'apps/server/src/domain/application/use-cases/teacher/fetch-teachers.use-case';
import { TeacherPresenter } from '../../presenters/teacher.presenter';

const querySchema = z.object({
  page: z.coerce.number().optional().default(1),
  query: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
});

@injectable()
export class FetchTeachersController {
  public readonly router: Router;

  constructor(@inject(FetchTeachersUseCase) private fetchUseCase: FetchTeachersUseCase) {
    this.router = Router();
    this.router.get('/teachers', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { page, query, status } = querySchema.parse(req.query);

    const result = await this.fetchUseCase.execute({ page, query, status });

    if (result.isFail()) return res.status(500).json({ message: 'Error fetching teachers' });

    const { teachers } = result.value;
    return res.status(200).json({ teachers: teachers.map(TeacherPresenter.toHTTP) });
  }
}
