import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from '../../repositories/lesson.repository';

type DeleteLessonUseCaseRequest = {
  lessonId: string;
};

type DeleteLessonUseCaseResponse = Either<Error, void>;

@singleton()
export class DeleteLessonUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute({
    lessonId,
  }: DeleteLessonUseCaseRequest): Promise<DeleteLessonUseCaseResponse> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      return fail(new ResourceNotFoundError('Lesson'));
    }

    const canDelete = await this.lessonRepository.delete(lessonId);
    if (!canDelete) {
      return fail(new CannotDeleteError('Lesson'));
    }

  return succeed(undefined);
  }
}
