import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { ITeacherRepository, TEACHER_REPOSITORY_TOKEN } from '../../repositories/teacher.repository';

type EditTeacherRequest = {
  teacherId: string;
  phone?: string;
  email?: string;
  pixKey?: string;
  expertise?: string;
  status?: string; // AC 3
  seriesIds?: string[]; // AC 4
};

type EditTeacherResponse = Either<Error, { teacherId: string }>;

@singleton()
export class EditTeacherUseCase {
  constructor(
    @inject(TEACHER_REPOSITORY_TOKEN) private teacherRepository: ITeacherRepository,
  ) {}

  async execute({ teacherId, seriesIds, ...props }: EditTeacherRequest): Promise<EditTeacherResponse> {
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      return fail(new ResourceNotFoundError('Teacher'));
    }

    teacher.update(props);

    const saved = await this.teacherRepository.save(teacher, seriesIds);

    if (!saved) {
      return fail(new CannotUpdateError('Teacher'));
    }

    return succeed({ teacherId: teacher.id.toString() });
  }
}
