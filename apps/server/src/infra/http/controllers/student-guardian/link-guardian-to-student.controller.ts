import { Router, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { LinkGuardianToStudentUseCase } from 'apps/server/src/domain/application/use-cases/student-guardian/link-guardian-to-student.use-case';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { Kinship } from 'apps/server/src/core/types/school-enums';

const linkGuardianToStudentParamSchema = z.object({
  studentId: z.string().min(1),
});

type LinkGuardianToStudentParamSchema = z.infer<typeof linkGuardianToStudentParamSchema>;

const linkGuardianToStudentBodySchema = z.object({
  guardianId: z.string().min(1),
  kinship: z.enum(Kinship),
});

type LinkGuardianToStudentBodySchema = z.infer<typeof linkGuardianToStudentBodySchema>;

const bodyValidationPipe = validateBody(linkGuardianToStudentBodySchema);

@injectable()
export class LinkGuardianToStudentController {
  public readonly router: Router;

  constructor(private readonly linkGuardianUseCase: LinkGuardianToStudentUseCase) {
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

  async handle(req: Request<LinkGuardianToStudentParamSchema>, res: Response) {
    // Validação manual dos params (pois o middleware valida apenas o body)
    const paramsValidation = linkGuardianToStudentParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }
    const { studentId } = paramsValidation.data;

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
