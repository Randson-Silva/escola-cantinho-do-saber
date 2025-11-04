import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { LessonEntity } from '../../../enterprise/entities/lesson.entity';
import {
  CLASS_REPOSITORY_TOKEN,
  IClassRepository,
} from '../../repositories/class.repository';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from '../../repositories/lesson.repository';

type CreateLessonUseCaseRequest = {
  classId: string;
  lessonDate: Date;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
};

type CreateLessonUseCaseResponse = Either<
  Error,
  { lessonId: string }
>;

@singleton()
export class CreateLessonUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({
    classId,
    lessonDate,
    startTime,
    endTime,
    duration,
  }: CreateLessonUseCaseRequest): Promise<CreateLessonUseCaseResponse> {
    try {
      const classExists = await this.classRepository.findById(classId);
      if (!classExists) {
        return fail(new ResourceNotFoundError('Class'));
      }

      const lesson = LessonEntity.create({
        classId,
        lessonDate,
        startTime,
        endTime,
        duration,
      });

      const canCreate = await this.lessonRepository.create(lesson);
      if (!canCreate) return fail(new CannotCreateError('Lesson'));

      return succeed({ lessonId: lesson.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create lesson due to error' + error));
    }
  }
}
