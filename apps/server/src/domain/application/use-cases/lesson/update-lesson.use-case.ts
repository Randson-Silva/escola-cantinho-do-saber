import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from '../../repositories/lesson.repository';
import { LessonEntity } from '../../../enterprise/entities/lesson.entity';

type UpdateLessonUseCaseRequest = {
  lessonId: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  duration?: string;
};

type UpdateLessonUseCaseResponse = Either<
  ResourceNotFoundError | CannotUpdateError,
  { lessonId: string }
>;

@singleton()
export class UpdateLessonUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute({
    lessonId,
    date,
    startTime,
    endTime,
    duration,
  }: UpdateLessonUseCaseRequest): Promise<UpdateLessonUseCaseResponse> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      return fail(new ResourceNotFoundError('Lesson'));
    }

    // Recria mantendo dados originais de criação
    const lessonEntity = LessonEntity.create(
      {
        classId: lesson.classId,
        date: date,
        duration: duration ?? lesson.duration,
        endTime: endTime ?? lesson.endTime,
        startTime: startTime ?? lesson.startTime,
        createdAt: lesson.createdAt,
        deletedAt: lesson.deletedAt,
      },
      lesson.id, // mesno ID
    );

    const canUpdate = await this.lessonRepository.update(lessonEntity);
    if (!canUpdate) {
      return fail(new CannotUpdateError('Lesson'));
    }

    return succeed({ lessonId: lesson.id.toString() });
  }
}
