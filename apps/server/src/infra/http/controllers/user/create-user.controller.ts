import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CreateUserUseCase } from 'apps/server/src/domain/application/use-cases/user/create-user.use-case';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { AuthService } from '../../../auth/auth.service';
import { injectable } from 'tsyringe';
import { CreateAccessJwtPayload } from 'apps/server/src/core/types/auth';
import { checkJwt, requireRole } from '../../../auth/auth.middleware';

const createUserBodySchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty('Name is mandatory')
    .refine(
      (val) => {
        const letras = val.replace(/[^A-Za-zÀ-ú]/g, '');
        return letras.length >= 5;
      },
      {
        message: 'Name must have 5 letters at least',
      },
    ),
  email: z.email().nonempty(),
  password: z.string().trim().nonempty().min(8),
  accessLevel: z.enum(['ADMIN', 'COMUM', 'PROFESSOR']),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

const bodyValidationPipe = validateBody(createUserBodySchema);

@injectable()
export class CreateUserController {
  public readonly router: Router;

  constructor(
    private readonly authService: AuthService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/auth/user/register',
      checkJwt,
      requireRole('ADMIN'),
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request, res: Response) {
    const body = req.body as CreateUserBodySchema;

    const { accessLevel, email, name, password } = body;

    const result = await this.createUserUseCase.execute({
      accessLevel,
      email,
      name,
      password,
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

    const { userId } = result.value;

    const accessToken = await this.authService.generateToken({
      payloadSource: { userId, accessLevel, name, email },
      payloadGenerator: (data) =>
        ({
          sub: data.userId,
          name: data.name,
          email: data.email,
          accessLevel: data.accessLevel,
          type: 'access',
        }) satisfies CreateAccessJwtPayload,
    });

    return res.status(200).json({ userId, accessToken });
  }
}
