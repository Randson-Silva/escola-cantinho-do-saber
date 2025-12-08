import { Either, fail, succeed } from 'apps/server/src/core/either';
import { AlreadyExistsError } from 'apps/server/src/core/errors/already-exists.error';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { IUserRepository, USERS_REPOSITORY_TOKEN } from '../../repositories/user.repository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from '../../repositories/profile.repository';
import { AuthService } from 'apps/server/src/infra/auth/auth.service';
import { ProfileEntity } from '../../../enterprise/entities/profile.entity';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { TeacherEntity } from '../../../enterprise/entities/teacher.entity';
import {
  ITeacherRepository,
  TEACHER_REPOSITORY_TOKEN,
} from '../../repositories/teacher.repository';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

type CreateTeacherRequest = {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  pixKey: string;
  startDate: Date;
  expertise?: string | null;
  qualifiedGrades: SchoolGrade[]; // Alterado de seriesIds
};

type CreateTeacherResponse = Either<
  Error,
  { teacherId: string; userEmail: string; password: string }
>;

@singleton()
export class CreateTeacherUseCase {
  constructor(
    @inject(TEACHER_REPOSITORY_TOKEN)
    private readonly teacherRepository: ITeacherRepository,
    @inject(USERS_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    name,
    taxId,
    phone,
    email,
    pixKey,
    startDate,
    expertise,
    qualifiedGrades,
  }: CreateTeacherRequest): Promise<CreateTeacherResponse> {

    if (!qualifiedGrades || qualifiedGrades.length === 0) {
      return fail(new Error('At least one qualified grade is required.'));
    }

    const emailExists = await this.teacherRepository.findByEmail(email);
    if (emailExists) {
      return fail(new AlreadyExistsError('Teacher with this email'));
    }

    const userWithEmail = await this.userRepository.findByEmail(email);
    if (userWithEmail) {
      return fail(new AlreadyExistsError('User with this email'));
    }

    const taxIdExists = await this.teacherRepository.findByTaxId(taxId);
    if (taxIdExists) {
      return fail(new AlreadyExistsError('Teacher with this CPF (taxId)'));
    }

    // Criar entidade Teacher
    const teacher = TeacherEntity.create({
      name,
      taxId,
      phone,
      email,
      pixKey,
      startDate,
      expertise,
      qualifiedGrades, // Passado direto para entidade
    });

    // Geração de Usuário e Perfil (Mantida a lógica original)
    const plainPassword = Math.random().toString(36).slice(2, 10);
    const hashedPassword = await this.authService.hashPassword(plainPassword);

    const profile = ProfileEntity.create({ accessLevel: 'PROFESSOR' });
    const profileCreated = await this.profileRepository.create(profile);
    if (!profileCreated) return fail(new CannotCreateError('Profile'));

    const user = UserEntity.create({
      name,
      email,
      password: hashedPassword,
      profile: profile,
    });

    const userCreated = await this.userRepository.create(user);
    if (!userCreated) {
      await this.profileRepository.delete(profile.id.toString());
      return fail(new CannotCreateError('User'));
    }

    // Criar Teacher no repositório (sem parâmetro extra seriesIds)
    const created = await this.teacherRepository.create(teacher);

    if (!created) {
      // Rollback manual (Idealmente seria uma transaction no repositório ou serviço de domínio, mas ok aqui)
      try {
        await this.userRepository.delete(user.id.toString());
        await this.profileRepository.delete(profile.id.toString());
      } catch (e) {
        console.error('Rollback failed', e);
      }
      return fail(new CannotCreateError('Teacher'));
    }

    return succeed({ teacherId: teacher.id.toString(), userEmail: email, password: plainPassword });
  }
}
