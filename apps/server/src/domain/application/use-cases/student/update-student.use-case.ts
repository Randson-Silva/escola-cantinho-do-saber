import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';

type UpdateStudentUseCaseRequest = {
  studentId: string;
  name?: string;
  birthDate?: Date;
  classId?: string;
  seriesId?: string | null;
};

type UpdateStudentUseCaseResponse = Either<CannotUpdateError, { studentId: string }>;

@singleton()
export class UpdateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    studentId,
    name,
    birthDate,
    classId,
    seriesId,
  }: UpdateStudentUseCaseRequest): Promise<UpdateStudentUseCaseResponse> {
    try {
      const foundStudent = await this.studentRepository.findById(studentId);

      if (!foundStudent) {
        return fail(new ResourceNotFoundError('Student not found'));
      }

      // mantém os dados originais e atualiza apenas os campos informados
      const updatedStudent = StudentEntity.create(
        {
          name: name ?? foundStudent.name,
          birthDate: birthDate ?? foundStudent.birthDate,
          classId: classId ?? foundStudent.classId,
          seriesId: seriesId ?? foundStudent.seriesId,
          addresses: foundStudent.addresses,
          guardians: foundStudent.guardians,
          enrollmentIds: foundStudent.enrollmentIds,
          attendanceIds: foundStudent.attendanceIds,
        },
        new UniqueEntityId(studentId),
      );

      const canUpdateStudent = await this.studentRepository.update(updatedStudent);

      if (!canUpdateStudent) {
        return fail(new CannotUpdateError('Student'));
      }

      return succeed({ studentId: updatedStudent.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update student due to error: ' + error));
    }
  }
}
