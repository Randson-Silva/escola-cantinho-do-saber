import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DeleteUserUseCase } from 'apps/server/src/domain/application/use-cases/user/delete-user.use-case';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { injectable } from 'tsyringe';
import { checkJwt, requireRole } from '../../../auth/auth.middleware';

const deleteUserParamsSchema = z.object({
  userId: z.string(),
});

type DeleteUserParamsSchema = z.infer<typeof deleteUserParamsSchema>;

@injectable()
export class DeleteUserController {
  public readonly router: Router;

  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.delete(
      '/users/:userId',
      checkJwt,
      requireRole('ADMIN'),

      this.handle.bind(this),
    );
  }

  async handle(req: Request<DeleteUserParamsSchema>, res: Response) {
    const { userId } = req.params;

    const result = await this.deleteUserUseCase.execute({
      userId,
    });

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

    return res.status(204).json();
  }
}
