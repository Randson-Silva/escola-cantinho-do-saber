import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { UpdateSerieUseCase } from 'apps/server/src/domain/application/use-cases/serie/update-serie.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const updateSerieParamSchema = z.object({
  serieId: z.string(),
});

type UpdateParamSchema = z.infer<typeof updateSerieParamSchema>;

const updateSerieBodySchema = z.object({
  name: z.string(),
});

type UpdateSerieBodySchema = z.infer<typeof updateSerieBodySchema>;

const bodyValidationPipe = validateBody(updateSerieBodySchema);

@injectable()
export class UpdateSerieController {
  public readonly router: Router;

  constructor(private readonly updateSerieUseCase: UpdateSerieUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/serie/:serieId',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<UpdateParamSchema>, res: Response) {
    const body = req.body as UpdateSerieBodySchema;

    const { name } = body;

    const { serieId } = req.params;

    const result = await this.updateSerieUseCase.execute({
      serieId,
      name,
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

    const { serieId: retrievedId } = result.value;

    return res.status(200).json({ serieId: retrievedId });
  }
}
