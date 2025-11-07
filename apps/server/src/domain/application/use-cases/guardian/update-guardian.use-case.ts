import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';

type UpdateGuardianUseCaseRequest = {
  guardianId: string;
  name: string;
  email: string | null;
  phones: string[];
};

type UpdateGuardianUseCaseResponse = Either<Error, { guardianId: string }>;
@singleton()
export class UpdateGuardianUseCase {
  constructor(
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
  ) {}

  async execute({
    guardianId,
    name,
    email,
    phones,
  }: UpdateGuardianUseCaseRequest): Promise<UpdateGuardianUseCaseResponse> {
    const guardian = await this.guardianRepository.findById(guardianId);
    if (!guardian) {
      return fail(new ResourceNotFoundError('Guardian'));
    }

    guardian.name = name;
    guardian.email = email;
    guardian.phones = phones;

    const canUpdate = await this.guardianRepository.update(guardian);
    if (!canUpdate) {
      return fail(new CannotUpdateError('Guardian'));
    }

    return succeed({ guardianId: guardian.id.toString() });
  }
}
