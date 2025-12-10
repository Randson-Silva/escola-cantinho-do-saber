import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { CLASS_REPOSITORY_TOKEN, IClassRepository } from '../../repositories/class.repository';
import { SchoolGrade, Shift } from 'apps/server/src/core/types/school-enums'; // Ajuste o path se necessário

type CreateClassUseCaseRequest = {
  name: string;
  teacherId: string;
  shift: Shift;
  grades: SchoolGrade[];

  studentIds?: string[] | null;
  lessonIds?: string[] | null;
};

type CreateClassUseCaseResponse = Either<CannotCreateError, { classId: string }>;

@singleton()
export class CreateClassUseCase {
  constructor(
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({
    name,
    teacherId,
    shift,
    grades,
    studentIds = null,
    lessonIds = null,
  }: CreateClassUseCaseRequest): Promise<CreateClassUseCaseResponse> {
    try {
      const classEntity = ClassEntity.create({
        name,
        teacherId,
        shift,
        grades,
        studentIds,
        lessonIds,
      });

      const canCreateClass = await this.classRepository.create(classEntity);

      if (!canCreateClass) {
        return fail(new CannotCreateError('Class'));
      }

      return succeed({ classId: classEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create Class due to error: ' + error));
    }
  }
}
