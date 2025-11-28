import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';
import {
  ITeacherRepository,
  TEACHER_REPOSITORY_TOKEN,
} from '../../repositories/teacher.repository';

type CreateTeacherRequest = {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  pixKey: string;
  startDate: Date;
  expertise?: string | null;
  seriesIds: string[]; // AC 1: Competências
};

type CreateTeacherResponse = Either<Error, { teacherId: string }>;

@singleton()
export class CreateTeacherUseCase {
  constructor(
    @inject(TEACHER_REPOSITORY_TOKEN)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  async execute({
    name,
    taxId,
    phone,
    email,
    pixKey,
    startDate,
    expertise,
    seriesIds,
  }: CreateTeacherRequest): Promise<CreateTeacherResponse> {
    if (!seriesIds || seriesIds.length === 0) {
      return fail(new Error('At least one series competency is required.'));
    }

    const emailExists = await this.teacherRepository.findByEmail(email);
    if (emailExists) {
      return fail(new AlreadyExistsError('Teacher with this email'));
    }

    const taxIdExists = await this.teacherRepository.findByTaxId(taxId);
    if (taxIdExists) {
      return fail(new AlreadyExistsError('Teacher with this CPF (taxId)'));
    }

    const teacher = TeacherEntity.create({
      name,
      taxId,
      phone,
      email,
      pixKey,
      startDate,
      expertise,
    });

    const created = await this.teacherRepository.create(teacher, seriesIds);

    if (!created) {
      return fail(new CannotCreateError('Teacher'));
    }

    return succeed({ teacherId: teacher.id.toString() });
  }
}
