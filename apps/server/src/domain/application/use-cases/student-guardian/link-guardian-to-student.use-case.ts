import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { StudentGuardianEntity } from '../../../enterprise/entities/student-guardian.entity';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from '../../repositories/guardian.repository';
import {
  IStudentGuardianRepository,
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/student-guardian.repository';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';

type LinkGuardianToStudentUseCaseRequest = {
  studentId: string;
  guardianId: string;
  kinship: string | null;
};

type LinkGuardianToStudentUseCaseResponse = Either<
  Error,
  { succes: true }
>;

@singleton()
export class LinkGuardianToStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
    @inject(STUDENT_GUARDIAN_REPOSITORY_TOKEN)
    private readonly studentGuardianRepository: IStudentGuardianRepository,
  ) {}

  async execute({
    studentId,
    guardianId,
    kinship,
  }: LinkGuardianToStudentUseCaseRequest): Promise<LinkGuardianToStudentUseCaseResponse> {
    try {
      const student = await this.studentRepository.findById(studentId);
      if (!student) return fail(new ResourceNotFoundError('Student'));

      const guardian = await this.guardianRepository.findById(guardianId);
      if (!guardian) return fail(new ResourceNotFoundError('Guardian'));

      const linkExists = await this.studentGuardianRepository.findUnique(
        studentId,
        guardianId,
      );
      if (linkExists) return fail(new AlreadyExistsError('Student-Guardian link'));

      const linkEntity = StudentGuardianEntity.create({
        studentId,
        guardianId,
        kinship,
      });

      const canCreateLink =
        await this.studentGuardianRepository.create(linkEntity);

      if (!canCreateLink)
        return fail(new CannotCreateError('Student-Guardian link'));

      return succeed({ succes: true });
    } catch (error) {
      return fail(new Error('Cannot create link due to error' + error));
    }
  }
}
