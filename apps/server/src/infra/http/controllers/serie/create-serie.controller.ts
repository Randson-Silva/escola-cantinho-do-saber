import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { CreateSerieUseCase } from 'apps/server/src/domain/application/use-cases/serie/create-serie.use-case';

const createSerieBodySchema = z.object({
  name: z.string(),
});

type CreateSerieBodySchema = z.infer<typeof createSerieBodySchema>;

const bodyValidationPipe = validateBody(createSerieBodySchema);

@injectable()
export class CreateSerieController {
  public readonly router: Router;

  constructor(private readonly createSerieUseCase: CreateSerieUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/serie',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateSerieBodySchema;

    const { name } = body;

    const result = await this.createSerieUseCase.execute({
      name,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { serieId } = result.value;

    return res.status(200).json({ serieId });
  }
}
