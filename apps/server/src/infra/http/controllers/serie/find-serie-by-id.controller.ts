import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindSerieByIdUseCase } from 'apps/server/src/domain/application/use-cases/serie/find-serie-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { SeriePresenter } from '../../presenters/serie.presenter';

const findSerieByIdParamSchema = z.object({
  serieId: z.string(),
});

type FindParamSchema = z.infer<typeof findSerieByIdParamSchema>;

@injectable()
export class FindSerieByIdController {
  public readonly router: Router;

  constructor(private readonly findSerieByIdSerieUseCase: FindSerieByIdUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/serie/:serieId',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<FindParamSchema>, res: Response) {
    const { serieId } = req.params;

    const result = await this.findSerieByIdSerieUseCase.execute({ serieId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { serieEntity } = result.value;

    return res.status(200).json(SeriePresenter.toHTTP(serieEntity));
  }
}
