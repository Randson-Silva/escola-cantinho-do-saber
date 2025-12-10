import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { GetTeacherProfileUseCase } from 'apps/server/src/domain/application/use-cases/teacher/get-teacher-profile.use-case';
import { TeacherPresenter } from '../../presenters/teacher.presenter';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

@injectable()
export class GetTeacherProfileController {
  public readonly router: Router;

  constructor(@inject(GetTeacherProfileUseCase) private getUseCase: GetTeacherProfileUseCase) {
    this.router = Router();
    this.router.get('/teachers/:id', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.getUseCase.execute({ teacherId: id });

    if (result.isFail()) {
      if (result.value instanceof ResourceNotFoundError)
        return res.status(404).json({ message: 'Teacher not found' });
      return res.status(500).json({ message: 'Internal error' });
    }

    const { teacher } = result.value;

    return res.status(200).json(TeacherPresenter.toHTTP(teacher));
  }
}
