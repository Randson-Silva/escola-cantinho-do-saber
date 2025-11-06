import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';

type UpdateClassUseCaseRequest = {
  classId: string;
  name: string;

  teacherId: string;
};

type UpdateClassUseCaseResponse = Either<CannotUpdateError, { classId: string }>;

@singleton()
export class UpdateClassUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({
    classId,
    name,
    teacherId,
  }: UpdateClassUseCaseRequest): Promise<UpdateClassUseCaseResponse> {
    try {
      const foundClass = await this.classRepository.findById(classId);

      if (!foundClass) return fail(new ResourceNotFoundError('Class not found'));

      const classEntity = ClassEntity.create(
        {
          name,
          teacherId,
        },
        new UniqueEntityId(classId),
      );

      const canUpdateClass = await this.classRepository.update(classEntity);

      if (!canUpdateClass) return fail(new CannotUpdateError('Class'));

      return succeed({ classId: classEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update class due to error' + error));
    }
  }
}
