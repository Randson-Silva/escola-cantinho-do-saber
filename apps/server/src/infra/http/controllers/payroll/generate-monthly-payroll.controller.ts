import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireRole} from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { GenerateMonthlyPayrollUseCase } from 'apps/server/src/domain/application/use-cases/payroll/generate-monthly-payroll.use-case';

const schema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
});

type Body = z.infer<typeof schema>;
const validation = validateBody(schema);

@injectable()
export class GenerateMonthlyPayrollController {
  public readonly router: Router;

  constructor(@inject(GenerateMonthlyPayrollUseCase) private useCase: GenerateMonthlyPayrollUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post(
      '/payrolls/generate',
      checkJwt,
      requireRole('ADMIN'),
      validation,
      this.handle.bind(this)
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as Body;

    const result = await this.useCase.execute(body);

    if (result.isFail()) {
      return res.status(500).json({ message: result.value.message });
    }

    return res.status(201).json(result.value);
  }
}
