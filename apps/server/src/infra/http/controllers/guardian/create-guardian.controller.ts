import { Router, Request, Response } from 'express';
import { inject, singleton } from 'tsyringe';
import { CreateGuardianUseCase } from 'apps/server/src/domain/application/use-cases/guardian/create-guardian.use-case';
import { createGuardianBodySchema } from '../../../http-body-validator/create-guardian.validator';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';

const bodyValidationPipe = validateBody(createGuardianBodySchema);

@singleton()
export class CreateGuardianController {
  public router: Router;

  constructor(
    @inject(CreateGuardianUseCase)
    private readonly createGuardianUseCase: CreateGuardianUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/guardians',
      checkJwt,
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  private async handle(req: Request, res: Response) {
    const { name, email, phones } = req.body;

    const result = await this.createGuardianUseCase.execute({
      name,
      email: email ?? null,
      phones,
    });

    if (result.isFail()) {
      const error = result.value;
      if (error instanceof AlreadyExistsError) {
        return res.status(409).send({ message: error.message });
      }
      return res.status(500).send({ message: 'Internal server error' });
    }

    return res.status(201).send(result.value);
  }
}
