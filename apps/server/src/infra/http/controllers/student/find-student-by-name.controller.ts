import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindStudentByNameUseCase } from 'apps/server/src/domain/application/use-cases/student/find-student-by-name.use-case';
import { StudentPresenter } from '../../presenters/student.presenter';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

// GET requests validam query params, não body
const findStudentByNameQuerySchema = z.object({
  studentName: z.string().min(1),
});

type FindStudentQuerySchema = z.infer<typeof findStudentByNameQuerySchema>;

@injectable()
export class FindStudentByNameController {
  public readonly router: Router;

  constructor(private readonly findStudentByNameStudentUseCase: FindStudentByNameUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Rota corrigida para plural e sem conflito com ID
    this.router.get('/students/search', checkJwt, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const queryValidation = findStudentByNameQuerySchema.safeParse(req.query);

    if (!queryValidation.success) {
      return res.status(400).json({ message: 'Invalid search query' });
    }

    const { studentName } = queryValidation.data;

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
