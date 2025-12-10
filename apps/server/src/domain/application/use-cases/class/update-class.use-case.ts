import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { IClassRepository, CLASS_REPOSITORY_TOKEN } from '../../repositories/class.repository';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';
import { SchoolGrade, Shift } from 'apps/server/src/core/types/school-enums';

type UpdateClassUseCaseRequest = {
  classId: string;
  name: string;
  teacherId: string;
  shift: Shift;
  grades: SchoolGrade[];

  studentIds?: string[] | null;
  lessonIds?: string[] | null;
};

type UpdateClassUseCaseResponse = Either<
  CannotUpdateError | ResourceNotFoundError,
  { classId: string }
>;

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
    shift,
    grades,
    studentIds = null,
    lessonIds = null,
  }: UpdateClassUseCaseRequest): Promise<UpdateClassUseCaseResponse> {
    try {
      const foundClass = await this.classRepository.findById(classId);

      if (!foundClass) {
        return fail(new ResourceNotFoundError('Class not found'));
      }

      const updatedClassEntity = ClassEntity.create(
        {
          name,
          teacherId,
          shift,
          grades,
          studentIds,
          lessonIds,
          createdAt: foundClass.createdAt,
          deletedAt: foundClass.deletedAt,
        },
        new UniqueEntityId(classId),
      );

      const canUpdateClass = await this.classRepository.update(updatedClassEntity);

      if (!canUpdateClass) {
        return fail(new CannotUpdateError('Class'));
      }

      return succeed({ classId: updatedClassEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update Class due to error: ' + error));
    }
  }
}
