import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';

type DeleteGuardianUseCaseRequest = {
  guardianId: string;
};

type DeleteGuardianUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

@singleton()
export class DeleteGuardianUseCase {
  constructor(
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
  ) {}

  async execute({
    guardianId,
  }: DeleteGuardianUseCaseRequest): Promise<DeleteGuardianUseCaseResponse> {
    const guardian = await this.guardianRepository.findById(guardianId);
    if (!guardian) {
      return fail(new ResourceNotFoundError('Guardian'));
    }

    const canDelete = await this.guardianRepository.delete(guardianId);
    if (!canDelete) {
      return fail(new CannotDeleteError('Guardian'));
    }

    return succeed(null);
  }
}
