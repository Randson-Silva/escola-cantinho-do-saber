import { Router, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt, IRequestWithUser } from '../../../auth/auth.middleware';
import { UpdateUserUseCase } from 'apps/server/src/domain/application/use-cases/user/update-user.use-case';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

const updateUserBodySchema = z.object({
  name: z.string().optional(),
});

const bodyValidationPipe = validateBody(updateUserBodySchema);

type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

@injectable()
export class UpdateUserController {
  public readonly router: Router;

  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.put(
      '/users/profile',
      checkJwt,
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: IRequestWithUser, res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const body = req.body as UpdateUserBodySchema;

    // Só passa o name se foi fornecido
    const updateData: any = {
      userId: user.sub,
    };

    if (body.name) {
      updateData.name = body.name;
    }

    const result = await this.updateUserUseCase.execute(updateData);

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case CannotUpdateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json({ message: 'User updated successfully' });
  }
}
