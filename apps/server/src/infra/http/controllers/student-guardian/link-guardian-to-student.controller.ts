import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { LinkGuardianToStudentUseCase } from 'apps/server/src/domain/application/use-cases/student-guardian/link-guardian-to-student.use-case';
import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { z } from 'zod';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

const linkGuardianToStudentParamsSchema = z.object({
  studentId: z.ulid(),
});

type LinkGuardianToStudentParamsSchema = z.infer<typeof linkGuardianToStudentParamsSchema>;

const linkGuardianToStudentBodySchema = z.object({
  guardianId: z.ulid(),
  kinship: z.string().nullable(),
});

type LinkGuardianToStudentBodySchema = z.infer<typeof linkGuardianToStudentBodySchema>;

const bodyValidationPipe = validateBody(linkGuardianToStudentBodySchema);

@singleton()
export class LinkGuardianToStudentController {
  public readonly router: Router;

  constructor(private readonly linkGuardianUseCase: LinkGuardianToStudentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/student/:studentId/guardians',
      checkJwt,
      bodyValidationPipe,

      this.handle.bind(this),
    );
  }

  async handle(req: Request<LinkGuardianToStudentParamsSchema>, res: Response) {
    const { studentId } = req.params;

    const body = req.body as LinkGuardianToStudentBodySchema;

    const { guardianId, kinship } = body;

    const result = await this.linkGuardianUseCase.execute({
      studentId,
      guardianId,
      kinship,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case AlreadyExistsError:
          return res.status(409).json({ message });
        case CannotCreateError:
          return res.status(400).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    const { linkId } = result.value;

    return res.status(201).json({ linkId });
  }
}
