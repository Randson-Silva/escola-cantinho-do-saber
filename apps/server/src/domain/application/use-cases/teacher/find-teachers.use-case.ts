import { Either, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';
import {
  ITeacherRepository,
  TEACHER_REPOSITORY_TOKEN,
} from '../../repositories/teacher.repository';

type FindTeachersRequest = {
  page: number;
  query?: string;
  status?: string;
};

type FindTeachersResponse = Either<Error, { teachers: TeacherEntity[] }>;

@singleton()
export class FindTeachersUseCase {
  constructor(@inject(TEACHER_REPOSITORY_TOKEN) private teacherRepository: ITeacherRepository) {}

  async execute(params: FindTeachersRequest): Promise<FindTeachersResponse> {
    const teachers = await this.teacherRepository.findMany(params);
    return succeed({ teachers });
  }
}
