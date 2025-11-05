import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { CLASS_REPOSITORY_TOKEN, IClassRepository } from '../../repositories/class.repository';

type CreateClassUseCaseRequest = {
  name: string;

  teacherId: string;
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
  }: CreateClassUseCaseRequest): Promise<CreateClassUseCaseResponse> {
    try {
      // !!
      // const foundTeacher = await this.teacherRepository.findById(teacherId);

      // if (!foundTeacher) return fail(new ResourceNotFoundError("Teacher not found"));

      const classEntity = ClassEntity.create({
        name,
        teacherId,
      });

      const canCreateClass = await this.classRepository.create(classEntity);

      if (!canCreateClass) return fail(new CannotCreateError('Class'));

      return succeed({ classId: classEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create Class due to error' + error));
    }
  }
}
