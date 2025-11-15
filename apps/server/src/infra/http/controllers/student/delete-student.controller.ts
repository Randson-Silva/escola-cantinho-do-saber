import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { DeleteStudentUseCase } from 'apps/server/src/domain/application/use-cases/student/delete-student.use-case';

const deleteStudentParamSchema = z.object({
  studentId: z.string(),
});

type DeleteParamSchema = z.infer<typeof deleteStudentParamSchema>;

@injectable()
export class DeleteStudentController {
  public readonly router: Router;

  constructor(private readonly deleteStudentUseCase: DeleteStudentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete(
      '/student/:studentId',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<DeleteParamSchema>, res: Response) {
    const { studentId } = req.params;

    const result = await this.deleteStudentUseCase.execute({ studentId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotDeleteError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json();
  }
}
