import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { LessonEntity } from '../../../enterprise/entities/lesson.entity';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from '../../repositories/lesson.repository';

type FindLessonByIdUseCaseRequest = {
  lessonId: string;
};

type FindLessonByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { lesson: LessonEntity }
>;

@singleton()
export class FindLessonByIdUseCase {
  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute({
    lessonId,
  }: FindLessonByIdUseCaseRequest): Promise<FindLessonByIdUseCaseResponse> {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson) {
      return fail(new ResourceNotFoundError('Lesson'));
    }

    return succeed({ lesson });
  }
}
