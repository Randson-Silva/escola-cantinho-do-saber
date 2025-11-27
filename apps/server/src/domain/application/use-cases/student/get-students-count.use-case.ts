import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';

type GetStudentsCountUseCaseResponse = Either<Error, { count: number }>;

@singleton()
export class GetStudentsCountUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(): Promise<GetStudentsCountUseCaseResponse> {
    try {
      const count = await this.studentRepository.getStudentsCount();

      return succeed({ count });
    } catch (error) {
      return fail(new Error('Cannot count due to error: ' + error));
    }
  }
}
