import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from '../../repositories/lesson.repository';

type UpdateLessonUseCaseRequest = {
  lessonId: string;
  lessonDate: Date;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
};

type UpdateLessonUseCaseResponse = Either<Error, { lessonId: string }>;

@singleton()
export class UpdateLessonUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute({
    lessonId,
    lessonDate,
    startTime,
    endTime,
    duration,
  }: UpdateLessonUseCaseRequest): Promise<UpdateLessonUseCaseResponse> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      return fail(new ResourceNotFoundError('Lesson'));
    }

    lesson.lessonDate = lessonDate;
    lesson.startTime = startTime;
    lesson.endTime = endTime;
    lesson.duration = duration;

    const canUpdate = await this.lessonRepository.update(lesson);
    if (!canUpdate) {
      return fail(new CannotUpdateError('Lesson'));
    }

return succeed({ lessonId: lesson.id.toString() });
  }
}
