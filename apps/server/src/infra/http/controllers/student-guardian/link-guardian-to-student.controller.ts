import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { LinkGuardianToStudentUseCase } from 'apps/server/src/domain/application/use-cases/student-guardian/link-guardian-to-student.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';

const linkGuardianToStudentParamSchema = z.object({
  studentId: z.string(),
});
type LinkParamSchema = z.infer<typeof linkGuardianToStudentParamSchema>;

const linkGuardianToStudentBodySchema = z.object({
  guardianId: z.string().ulid(),
  kinship: z.string().nullable().default(null),
});
type LinkBodySchema = z.infer<typeof linkGuardianToStudentBodySchema>;

const bodyValidationPipe = validateBody(linkGuardianToStudentBodySchema);

@injectable()
export class LinkGuardianToStudentController {
  public readonly router: Router;

  constructor(
    private readonly linkGuardianUseCase: LinkGuardianToStudentUseCase,
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/students/:studentId/guardians',
      checkJwt,
      bodyValidationPipe,
      this.handle.bind(this),
    );
  }

  async handle(req: Request<LinkParamSchema>, res: Response) {
    const body = req.body as LinkBodySchema;
    const { studentId } = req.params;

    const result = await this.linkGuardianUseCase.execute({
      studentId,
      guardianId: body.guardianId,
      kinship: body.kinship,
    });

    if (result.isFail()) {
      const exception = result.value;
      const message = exception.message;

      switch (exception.constructor) {
        case CannotCreateError:
          return res.status(400).json({ message });
        case ResourceNotFoundError:
          return res.status(404).json({ message });
        case AlreadyExistsError:
          return res.status(409).json({ message });
        default:
          return res.status(500).json({ message });
      }
    }

    return res.status(200).json();
  }
}
