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
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

type UpdateStudentUseCaseRequest = {
  studentId: string;
  name?: string;
  birthDate?: Date;
  classId?: string;
  currentGrade?: SchoolGrade;
};

type UpdateStudentUseCaseResponse = Either<
  CannotUpdateError | ResourceNotFoundError,
  { studentId: string }
>;

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
    currentGrade,
  }: UpdateStudentUseCaseRequest): Promise<UpdateStudentUseCaseResponse> {
    try {
      const foundStudent = await this.studentRepository.findById(studentId);

      if (!foundStudent) {
        return fail(new ResourceNotFoundError('Student not found'));
      }

      const updatedStudent = StudentEntity.create(
        {
          name: name ?? foundStudent.name,
          birthDate: birthDate ?? foundStudent.birthDate,
          classId: classId ?? foundStudent.classId,
          currentGrade: currentGrade ?? foundStudent.currentGrade,

          // Preserva relacionamentos e auditoria
          addressIds: foundStudent.addressIds,
          guardianIds: foundStudent.guardianIds,
          enrollmentIds: foundStudent.enrollmentIds,
          attendanceIds: foundStudent.attendanceIds,
          createdAt: foundStudent.createdAt,
          deletedAt: foundStudent.deletedAt,
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
