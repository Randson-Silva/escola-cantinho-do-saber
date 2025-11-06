import { CreateGuardianUseCase } from 'apps/server/src/domain/application/use-cases/guardian/create-guardian.use-case';
import { inject, singleton } from 'tsyringe';
import { Router, Request, Response } from 'express';
import { createGuardianBodySchema } from '../../../http-body-validator/create-guardian.validator';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';

@singleton()
export class CreateGuardianController {
  public router: Router;

  constructor(
    @inject(CreateGuardianUseCase)
    private readonly createGuardianUseCase: CreateGuardianUseCase,
  ) {
    this.router = Router();
    this.router.post('/guardians', (req, res) => this.handle(req, res));
  }

  private async handle(req: Request, res: Response) {
    const validation = createGuardianBodySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).send({
        message: 'Invalid request body',
        errors: validation.error.format(),
      });
    }

    const { name, email, phones } = validation.data;
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
