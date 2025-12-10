import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import {
  ITeacherRepository,
  TEACHER_REPOSITORY_TOKEN,
} from '../../repositories/teacher.repository';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';

type UpdateTeacherRequest = {
  teacherId: string;
  name?: string;
  phone?: string;
  email?: string;
  pixKey?: string;
  expertise?: string;
  status?: string;
  qualifiedGrades?: SchoolGrade[];
};

type UpdateTeacherResponse = Either<Error, { teacherId: string }>;

@singleton()
export class UpdateTeacherUseCase {
  constructor(@inject(TEACHER_REPOSITORY_TOKEN) private teacherRepository: ITeacherRepository) {}

  async execute({
    teacherId,
    name,
    phone,
    email,
    pixKey,
    expertise,
    status,
    qualifiedGrades,
  }: UpdateTeacherRequest): Promise<UpdateTeacherResponse> {
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      return fail(new ResourceNotFoundError('Teacher'));
    }

    const updatedTeacher = TeacherEntity.create(
      {
        name: name ?? teacher.name,
        taxId: teacher.taxId,
        startDate: teacher.startDate,

        phone: phone ?? teacher.phone,
        email: email ?? teacher.email,
        pixKey: pixKey ?? teacher.pixKey,
        expertise: expertise ?? teacher.expertise,
        status: status ?? teacher.status,
        qualifiedGrades: qualifiedGrades ?? teacher.qualifiedGrades,

        createdAt: teacher.createdAt,
        deletedAt: teacher.deletedAt,
      },
      teacher.id,
    );

    const saved = await this.teacherRepository.save(updatedTeacher);

    if (!saved) {
      return fail(new CannotUpdateError('Teacher'));
    }

    return succeed({ teacherId: updatedTeacher.id.toString() });
  }
}
