import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import { inject, singleton } from 'tsyringe';

type FindStudentByNameUseCaseRequest = {
  studentName: string;
};

type FindStudentByNameUseCaseResponse = Either<Error, { students: StudentEntity[] }>;

@singleton()
export class FindStudentByNameUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({
    studentName,
  }: FindStudentByNameUseCaseRequest): Promise<FindStudentByNameUseCaseResponse> {
    try {
      const students = await this.studentRepository.findByName(studentName);

      return succeed({ students: students });
    } catch (error) {
      return fail(new Error('Cannot fetch students due to error: ' + error));
    }
  }
}
