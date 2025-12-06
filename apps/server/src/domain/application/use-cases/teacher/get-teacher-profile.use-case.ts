import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';
import { ITeacherRepository, TEACHER_REPOSITORY_TOKEN } from '../../repositories/teacher.repository';

type GetTeacherProfileRequest = { teacherId: string };
type GetTeacherProfileResponse = Either<ResourceNotFoundError, { teacher: TeacherEntity }>;

@singleton()
export class GetTeacherProfileUseCase {
  constructor(
    @inject(TEACHER_REPOSITORY_TOKEN) private teacherRepository: ITeacherRepository,
  ) {}

  async execute({ teacherId }: GetTeacherProfileRequest): Promise<GetTeacherProfileResponse> {
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      return fail(new ResourceNotFoundError('Teacher'));
    }

    return succeed({ teacher });
  }
}
