import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { ClassEntity } from '../../../enterprise/entities/class.entity';
import { CLASS_REPOSITORY_TOKEN, IClassRepository } from '../../repositories/class.repository';

type CreateClassUseCaseRequest = {
  name: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;

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
    duration,
    endTime,
    name,
    startTime,
    teacherId,
  }: CreateClassUseCaseRequest): Promise<CreateClassUseCaseResponse> {
    try {
      // !!
      // const foundTeacher = await this.teacherRepository.findById(teacherId);

      // if (!foundTeacher) return fail(new ResourceNotFoundError("Teacher not found"));

      const classEntity = ClassEntity.create({
        duration,
        endTime,
        name,
        startTime,
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
