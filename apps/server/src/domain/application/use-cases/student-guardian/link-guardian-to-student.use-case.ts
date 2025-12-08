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
import { Kinship } from 'apps/server/src/core/types/school-enums';

type LinkGuardianToStudentUseCaseRequest = {
  studentId: string;
  guardianId: string;
  kinship: Kinship; // Correção: enum
};

type LinkGuardianToStudentUseCaseResponse = Either<
  ResourceNotFoundError | AlreadyExistsError | CannotCreateError,
  { linkId: string } // Retornamos o id composto
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
      // Verifica se Aluno existe
      const student = await this.studentRepository.findById(studentId);
      if (!student) return fail(new ResourceNotFoundError('Student'));

      // Verifica se Responsável existe
      const guardian = await this.guardianRepository.findById(guardianId);
      if (!guardian) return fail(new ResourceNotFoundError('Guardian'));

      // Verifica se já existe o vínculo
      const linkExists = await this.studentGuardianRepository.findUnique(studentId, guardianId);
      if (linkExists) return fail(new AlreadyExistsError('Student-Guardian link'));

      // Cria a entidade de vínculo
      const linkEntity = StudentGuardianEntity.create({
        studentId,
        guardianId,
        kinship,
      });

      // Persiste
      const canCreateLink = await this.studentGuardianRepository.create(linkEntity);

      if (!canCreateLink) return fail(new CannotCreateError('Student-Guardian link'));

      // Como é uma chave composta, geramos uma representação textual ou retornamos sucesso
      const linkId = `${studentId}_${guardianId}`;

      return succeed({ linkId });
    } catch (error) {
      return fail(new Error('Cannot create link due to error: ' + error));
    }
  }
}
