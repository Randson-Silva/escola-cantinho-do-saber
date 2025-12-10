import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateGuardianUseCase } from 'apps/server/src/domain/application/use-cases/guardian/update-guardian.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const updateGuardianParamSchema = z.object({
  id: z.string(),
});
type UpdateParamSchema = z.infer<typeof updateGuardianParamSchema>;

const updateGuardianBodySchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email().nullable().default(null),
  // CORREÇÃO: O Prisma e a Entidade definem phone como String única
  phone: z.string().min(1),
});

type UpdateGuardianBodySchema = z.infer<typeof updateGuardianBodySchema>;

const bodyValidationPipe = validateBody(updateGuardianBodySchema);

@injectable()
export class UpdateGuardianController {
  public readonly router: Router;

  constructor(private readonly updateGuardianUseCase: UpdateGuardianUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put('/guardians/:id', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateGuardianBodySchema;
    const { id } = req.params;

    const result = await this.updateGuardianUseCase.execute({
      guardianId: id,
      name: body.name,
      email: body.email,
      phone: body.phone,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotUpdateError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { guardianId } = result.value;
    return res.status(200).json({ guardianId });
  }
}
