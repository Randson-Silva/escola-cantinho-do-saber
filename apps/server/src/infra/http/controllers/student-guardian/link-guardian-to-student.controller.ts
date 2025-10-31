import { LinkGuardianToStudentUseCase } from 'apps/server/src/domain/application/use-cases/student-guardian/link-guardian-to-student.use-case';
import { inject, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import {
  linkGuardianToStudentBodySchema,
  studentGuardianParamsSchema,
} from '../../../http-body-validator/link-guardian-to-student.validator';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';

@singleton()
export class LinkGuardianToStudentController {
  constructor(
    @inject(LinkGuardianToStudentUseCase)
    private readonly linkGuardianUseCase: LinkGuardianToStudentUseCase,
  ) {}

  async handle(req: Request, res: Response) {
    const paramsValidation = studentGuardianParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).send({ message: 'Invalid URL params' });
    }
    const { studentId } = paramsValidation.data;

    const bodyValidation = linkGuardianToStudentBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).send({ message: 'Invalid request body' });
    }
    const { guardianId, kinship } = bodyValidation.data;

    const result = await this.linkGuardianUseCase.execute({
      studentId,
      guardianId,
      kinship: kinship ?? null,
    });

    if (result.isFail()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        return res.status(404).send({ message: error.message });
      }
      if (error instanceof AlreadyExistsError) {
        return res.status(409).send({ message: error.message });
      }

      return res.status(500).send({ message: 'Internal server error' });
    }

    return res.status(201).send(result.value);
  }
}
