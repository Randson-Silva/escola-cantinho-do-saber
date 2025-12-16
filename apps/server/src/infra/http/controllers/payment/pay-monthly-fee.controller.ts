import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { PayMonthlyFeeUseCase } from 'apps/server/src/domain/application/use-cases/payment/pay-monthly-fee.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const schema = z.object({
  method: z.enum(['PIX', 'DINHEIRO']),
  date: z.string().datetime().optional(),
});

type Body = z.infer<typeof schema>;
const validation = validateBody(schema);

@injectable()
export class PayMonthlyFeeController {
  public readonly router: Router;

  constructor(@inject(PayMonthlyFeeUseCase) private useCase: PayMonthlyFeeUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.patch(
      '/payments/:id/pay',
      checkJwt,
      requireAnyRole(['ADMIN', 'COMUM']),
      validation,
      this.handle.bind(this)
    );
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const body = req.body as Body;

    const result = await this.useCase.execute({
      paymentId: id,
      method: body.method,
      paymentDate: body.date ? new Date(body.date) : undefined
    });

    if (result.isFail()) {
      if (result.value instanceof ResourceNotFoundError) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      return res.status(500).json({ message: result.value.message });
    }

    return res.status(200).json(result.value);
  }
}
