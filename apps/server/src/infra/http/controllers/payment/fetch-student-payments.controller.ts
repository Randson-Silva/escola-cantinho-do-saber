import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireRole } from '../../../auth/auth.middleware';
import { FetchStudentPaymentsUseCase } from 'apps/server/src/domain/application/use-cases/payment/fetch-student-payments.use-case';

@injectable()
export class FetchStudentPaymentsController {
  public readonly router: Router;

  constructor(@inject(FetchStudentPaymentsUseCase) private useCase: FetchStudentPaymentsUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get(
      '/students/:studentId/payments',
      checkJwt,
      requireRole('ADMIN'),
      this.handle.bind(this)
    );
  }

  async handle(req: Request, res: Response) {
    const { studentId } = req.params;

    const result = await this.useCase.execute({ studentId });

    if (result.isFail()) {
      return res.status(500).json({ message: result.value.message });
    }

    return res.status(200).json(result.value);
  }
}
