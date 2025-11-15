import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';

type FindGuardianByIdUseCaseRequest = {
  guardianId: string;
};

type FindGuardianByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { guardian: GuardianEntity }
>;

@singleton()
export class FindGuardianByIdUseCase {
  constructor(
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
  ) {}

  async execute({
    guardianId,
  }: FindGuardianByIdUseCaseRequest): Promise<FindGuardianByIdUseCaseResponse> {
    const guardian = await this.guardianRepository.findById(guardianId);

    if (!guardian) {
      return fail(new ResourceNotFoundError('Guardian'));
    }

    return succeed({ guardian });
  }
}
