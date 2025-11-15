import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { DeleteSerieUseCase } from 'apps/server/src/domain/application/use-cases/serie/delete-serie.use-case';

const deleteSerieParamSchema = z.object({
  serieId: z.string(),
});

type DeleteParamSchema = z.infer<typeof deleteSerieParamSchema>;

@injectable()
export class DeleteSerieController {
  public readonly router: Router;

  constructor(private readonly deleteSerieUseCase: DeleteSerieUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete(
      '/serie/:serieId',
      checkJwt,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<DeleteParamSchema>, res: Response) {
    const { serieId } = req.params;

    const result = await this.deleteSerieUseCase.execute({ serieId });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotDeleteError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json();
  }
}
