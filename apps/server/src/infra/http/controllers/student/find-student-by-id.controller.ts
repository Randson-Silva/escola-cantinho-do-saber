import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindStudentByIdUseCase } from 'apps/server/src/domain/application/use-cases/student/find-student-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { StudentPresenter } from '../../presenters/student.presenter';

const findStudentByIdParamSchema = z.object({
  studentId: z.string(),
});

type FindParamSchema = z.infer<typeof findStudentByIdParamSchema>;

@injectable()
export class FindStudentByIdController {
  public readonly router: Router;

  constructor(private readonly findStudentByIdStudentUseCase: FindStudentByIdUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/student/:studentId',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<FindParamSchema>, res: Response) {
    const { studentId } = req.params;

    const result = await this.findStudentByIdStudentUseCase.execute({ studentId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { student } = result.value;

    return res.status(200).json(StudentPresenter.toHTTP(student));
  }
}
