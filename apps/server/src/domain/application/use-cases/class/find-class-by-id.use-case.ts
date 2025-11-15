import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { inject, singleton } from 'tsyringe';

type FindClassByIdUseCaseRequest = {
  classId: string;
};

type FindClassByIdUseCaseResponse = Either<ResourceNotFoundError, { classEntity: ClassEntity }>;

@singleton()
export class FindClassByIdUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({ classId }: FindClassByIdUseCaseRequest): Promise<FindClassByIdUseCaseResponse> {
    try {
      const foundClass = await this.classRepository.findById(classId);

      if (!foundClass) return fail(new ResourceNotFoundError('Class not found'));

      return succeed({ classEntity: foundClass });
    } catch (error) {
      return fail(new Error('Class was not found due to error: ' + error));
    }
  }
}
