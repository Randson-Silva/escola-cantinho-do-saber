import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireRole } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { RegisterExpenseUseCase } from 'apps/server/src/domain/application/use-cases/expense/register-expense.use-case';
import { ExpenseCategory } from '@prisma/client'; // Para validar o enum no Zod

const schema = z.object({
  description: z.string().min(3),
  amount: z.number().positive(),
  date: z.string().datetime(),
  category: z.nativeEnum(ExpenseCategory),
});

type Body = z.infer<typeof schema>;
const validation = validateBody(schema);

@injectable()
export class RegisterExpenseController {
  public readonly router: Router;

  constructor(@inject(RegisterExpenseUseCase) private useCase: RegisterExpenseUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post(
      '/expenses',
      checkJwt,
      requireRole('ADMIN'),
      validation,
      this.handle.bind(this)
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as Body;

    const result = await this.useCase.execute({
      ...body,
      date: new Date(body.date),
    });

    if (result.isFail()) {
      return res.status(500).json({ message: result.value.message });
    }

    return res.status(201).json(result.value);
  }
}
