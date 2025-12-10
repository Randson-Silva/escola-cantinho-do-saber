import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { inject, singleton } from 'tsyringe';

type DeleteClassUseCaseRequest = {
  classId: string;
};

type DeleteClassUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

@singleton()
export class DeleteClassUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({ classId }: DeleteClassUseCaseRequest): Promise<DeleteClassUseCaseResponse> {
    try {
      const foundClass = await this.classRepository.findById(classId);

      if (!foundClass) return fail(new ResourceNotFoundError('Class not found'));

      const classWasDeleted = await this.classRepository.delete(classId);

      if (!classWasDeleted) return fail(new CannotDeleteError('Class'));

      return succeed(null);
    } catch (err) {
      return fail(new Error('Could not delete class due to error: ' + err));
    }
  }
}
