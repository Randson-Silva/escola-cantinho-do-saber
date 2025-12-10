import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';

type CreateGuardianUseCaseRequest = {
  name: string;
  email: string | null;
  phone: string;
};

type CreateGuardianUseCaseResponse = Either<
  AlreadyExistsError | CannotCreateError,
  { guardianId: string }
>;

@singleton()
export class CreateGuardianUseCase {
  constructor(
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
  ) {}

  async execute({
    name,
    email,
    phone,
  }: CreateGuardianUseCaseRequest): Promise<CreateGuardianUseCaseResponse> {
    try {
      if (email) {
        const guardianExists = await this.guardianRepository.findByEmail(email);
        if (guardianExists) {
          return fail(new AlreadyExistsError('Guardian with this email'));
        }
      }

      const guardian = GuardianEntity.create({
        name,
        email,
        phone,
      });

      const canCreateGuardian = await this.guardianRepository.create(guardian);

      if (!canCreateGuardian) return fail(new CannotCreateError('Guardian'));

      return succeed({ guardianId: guardian.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create guardian due to error' + error));
    }
  }
}
