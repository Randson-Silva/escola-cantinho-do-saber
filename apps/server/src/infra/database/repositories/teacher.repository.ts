import {
  ITeacherRepository,
  TeacherFilterParams,
} from 'apps/server/src/domain/application/repositories/teacher.repository';
import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { TeacherMapper } from '../mapper/teacher.mapper';
import { TeacherSchema } from '../schemas/teacher.schema';

@singleton()
export class TeacherRepository implements ITeacherRepository {
  async create(teacher: TeacherEntity): Promise<boolean> {
    try {
      const raw = TeacherMapper.toDatabase(teacher);

      await prisma.teacher.create({
        data: {
          id: raw.id,
          name: raw.name,
          taxId: raw.taxId,
          phone: raw.phone,
          pixKey: raw.pixKey,
          expertise: raw.expertise,
          email: raw.email,
          startDate: raw.startDate,
          status: raw.status,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
          qualifiedGrades: raw.qualifiedGrades,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findByEmail(email: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher || teacher.deletedAt) return null;
    return TeacherMapper.toDomain(teacher as TeacherSchema);
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher || teacher.deletedAt) return null;
    return TeacherMapper.toDomain(teacher as TeacherSchema);
  }

  async findMany({ page, query, status }: TeacherFilterParams): Promise<TeacherEntity[]> {
    const teachers = await prisma.teacher.findMany({
      where: {
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        status: status && status !== 'ALL' ? status : undefined,
        deletedAt: null,
      },
      take: 20,
      skip: (page - 1) * 20,
      orderBy: { name: 'asc' },
    });
    return teachers.map((t) => TeacherMapper.toDomain(t as TeacherSchema));
  }

  async save(teacher: TeacherEntity): Promise<boolean> {
    try {
      const raw = TeacherMapper.toDatabase(teacher);

      await prisma.teacher.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          taxId: raw.taxId,
          phone: raw.phone,
          pixKey: raw.pixKey,
          expertise: raw.expertise,
          email: raw.email,
          startDate: raw.startDate,
          status: raw.status,
          deletedAt: raw.deletedAt,
          qualifiedGrades: raw.qualifiedGrades,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.teacher.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findByTaxId(taxId: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { taxId } });
    if (!teacher || teacher.deletedAt) return null;
    return TeacherMapper.toDomain(teacher as TeacherSchema);
  }
}
