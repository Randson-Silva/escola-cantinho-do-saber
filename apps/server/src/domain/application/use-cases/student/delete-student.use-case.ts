import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { inject, singleton } from 'tsyringe';

type DeleteStudentUseCaseRequest = {
  studentId: string;
};

type DeleteStudentUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

@singleton()
export class DeleteStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute({ studentId }: DeleteStudentUseCaseRequest): Promise<DeleteStudentUseCaseResponse> {
    try {
      const foundStudent = await this.studentRepository.findById(studentId);

      if (!foundStudent) return fail(new ResourceNotFoundError('Student not found'));

      const studentWasDeleted = await this.studentRepository.delete(studentId);

      if (!studentWasDeleted) return fail(new CannotDeleteError('Student'));

      return succeed(null);
    } catch (err) {
      return fail(new Error('Could not delete student due to error: ' + err));
    }
  }
}
