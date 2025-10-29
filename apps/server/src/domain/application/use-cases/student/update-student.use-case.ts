import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';

type UpdateStudentUseCaseRequest = {
  studentId: string;
  birthDate: Date;
  name: string;
};

type UpdateStudentUseCaseResponse = Either<CannotUpdateError, { studentId: string }>;

@singleton()
export class UpdateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    birthDate,
    name,
    studentId,
  }: UpdateStudentUseCaseRequest): Promise<UpdateStudentUseCaseResponse> {
    try {
      const foundStudent = await this.studentRepository.findById(studentId);

      if (!foundStudent) return fail(new ResourceNotFoundError('Student not found'));

      const student = StudentEntity.create(
        {
          birthDate,
          name,
          // !
          classId: '1',
          seriesId: '1',
        },
        new UniqueEntityId(studentId),
      );

      const canUpdateStudent = await this.studentRepository.update(student);

      if (!canUpdateStudent) return fail(new CannotUpdateError('Student'));

      return succeed({ studentId: student.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update student due to error' + error));
    }
  }
}
