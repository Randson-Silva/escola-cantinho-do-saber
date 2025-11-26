import { Either, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';
import { ITeacherRepository, TEACHER_REPOSITORY_TOKEN } from '../../repositories/teacher.repository';

type FetchTeachersRequest = {
  page: number;
  query?: string;
  status?: string;
};

type FetchTeachersResponse = Either<Error, { teachers: TeacherEntity[] }>;

@singleton()
export class FetchTeachersUseCase {
  constructor(
    @inject(TEACHER_REPOSITORY_TOKEN) private teacherRepository: ITeacherRepository,
  ) {}

  async execute(params: FetchTeachersRequest): Promise<FetchTeachersResponse> {
    const teachers = await this.teacherRepository.findMany(params);
    return succeed({ teachers });
  }
}
