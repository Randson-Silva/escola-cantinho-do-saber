import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';

type UpdateGuardianUseCaseRequest = {
  guardianId: string;
  name: string;
  email: string | null;
  phone: string;
};

type UpdateGuardianUseCaseResponse = Either<
  ResourceNotFoundError | CannotUpdateError,
  { guardianId: string }
>;

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
    phone,
  }: UpdateGuardianUseCaseRequest): Promise<UpdateGuardianUseCaseResponse> {
    const guardian = await this.guardianRepository.findById(guardianId);
    if (!guardian) {
      return fail(new ResourceNotFoundError('Guardian'));
    }

    const guardianEntity = GuardianEntity.create(
      {
        email,
        name,
        phone,
        addressIds: guardian.addressIds,
        studentIds: guardian.studentIds,
        createdAt: guardian.createdAt,
        deletedAt: guardian.deletedAt,
      },
      guardian.id,
    );

    const canUpdate = await this.guardianRepository.update(guardianEntity);
    if (!canUpdate) {
      return fail(new CannotUpdateError('Guardian'));
    }

    return succeed({ guardianId: guardian.id.toString() });
  }
}
