import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';

type CreateStudentUseCaseRequest = {
  birthDate: Date;
  name: string;
};

type CreateStudentUseCaseResponse = Either<CannotCreateError, { studentId: string }>;

@singleton()
export class CreateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    birthDate,
    name,
  }: CreateStudentUseCaseRequest): Promise<CreateStudentUseCaseResponse> {
    try {
      const student = StudentEntity.create({
        birthDate,
        name,
        // !!!
        classId: '1',
        seriesId: '1',
      });

      const canCreateStudent = await this.studentRepository.create(student);

      if (!canCreateStudent) return fail(new CannotCreateError('Student'));

      return succeed({ studentId: student.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create student due to error' + error));
    }
  }
}
