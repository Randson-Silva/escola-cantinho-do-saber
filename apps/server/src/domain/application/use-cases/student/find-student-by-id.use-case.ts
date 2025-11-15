import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import { inject, singleton } from 'tsyringe';

type FindStudentByIdUseCaseRequest = {
  studentId: string;
};

type FindStudentByIdUseCaseResponse = Either<ResourceNotFoundError, { student: StudentEntity }>;

@singleton()
export class FindStudentByIdUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    studentId,
  }: FindStudentByIdUseCaseRequest): Promise<FindStudentByIdUseCaseResponse> {
    try {
      const foundStudent = await this.studentRepository.findById(studentId);

      if (!foundStudent) return fail(new ResourceNotFoundError('Student not found'));

      return succeed({ student: foundStudent });
    } catch (error) {
      return fail(new Error('Student was not found due to error: ' + error));
    }
  }
}
