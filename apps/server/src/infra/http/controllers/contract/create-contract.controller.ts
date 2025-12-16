import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable, inject } from 'tsyringe';
import { checkJwt, requireAnyRole } from '../../../auth/auth.middleware'; // Ajuste requireRole se necessário
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CreateContractUseCase } from 'apps/server/src/domain/application/use-cases/contract/create-contract.use-case';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

const schema = z.object({
  studentId: z.string().ulid(),
  grade: z.nativeEnum(SchoolGrade),
  durationMinutes: z.number().min(30),
  dueDateDay: z.number().min(1).max(31),
});

type Body = z.infer<typeof schema>;
const validation = validateBody(schema);

@injectable()
export class CreateContractController {
  public readonly router: Router;

  constructor(@inject(CreateContractUseCase) private useCase: CreateContractUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post(
      '/contracts',
      checkJwt,
      validation,
      requireAnyRole(['ADMIN']),
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
