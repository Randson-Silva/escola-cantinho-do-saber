import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindStudentByNameUseCase } from 'apps/server/src/domain/application/use-cases/student/find-student-by-name.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { StudentPresenter } from '../../presenters/student.presenter';

const findStudentByNameBodySchema = z.object({
  studentName: z.string(),
});

type FindBodySchema = z.infer<typeof findStudentByNameBodySchema>;

@injectable()
export class FindStudentByNameController {
  public readonly router: Router;

  constructor(private readonly findStudentByNameStudentUseCase: FindStudentByNameUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/student',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const { studentName } = req.body as FindBodySchema;

    const result = await this.findStudentByNameStudentUseCase.execute({ studentName });

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

    const { students } = result.value;

    return res.status(200).json(students.map(StudentPresenter.toHTTP));
  }
}
