import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { FindGuardianByIdUseCase } from 'apps/server/src/domain/application/use-cases/guardian/find-guardian-by-id.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { GuardianPresenter } from '../../presenters/guardian.presenter';

const findGuardianByIdParamSchema = z.object({
  id: z.string(),
});

type FindParamSchema = z.infer<typeof findGuardianByIdParamSchema>;

@injectable()
export class FindGuardianByIdController {
  public readonly router: Router;

  constructor(
    private readonly findGuardianByIdUseCase: FindGuardianByIdUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/guardians/:id',
      checkJwt,
      this.handle.bind(this),
    );
  }

  async handle(req: Request<FindParamSchema>, res: Response) {
    const { id } = req.params;

    const result = await this.findGuardianByIdUseCase.execute({
      guardianId: id,
    });

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

    const { guardian } = result.value;

    return res.status(200).json(GuardianPresenter.toHTTP(guardian));
  }
}
