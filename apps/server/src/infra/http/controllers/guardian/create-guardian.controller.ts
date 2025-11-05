import { Router, Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { CreateGuardianUseCase } from 'apps/server/src/domain/application/use-cases/guardian/create-guardian.use-case';
import z from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { checkJwt } from '../../../auth/auth.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';

export const createGuardianBodySchema = z.object({
  name: z.string().min(3),
  email: z.email().nullable(),
  phones: z.string().array().min(1),
});

export type CreateGuardianBodySchema = z.infer<typeof createGuardianBodySchema>;

const bodyValidationPipe = validateBody(createGuardianBodySchema);

@singleton()
export class CreateGuardianController {
  public readonly router: Router;

  constructor(private readonly createGuardianUseCase: CreateGuardianUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/guardian',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateGuardianBodySchema;

    const { name, email, phones } = body;

    const result = await this.createGuardianUseCase.execute({
      name,
      email,
      phones,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        case AlreadyExistsError:
          return res.status(409).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { guardianId } = result.value;

    return res.status(201).json({ guardianId });
  }
}
