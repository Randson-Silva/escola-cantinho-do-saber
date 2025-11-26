import { ITeacherRepository } from 'apps/server/src/domain/application/repositories/teacher.repository';
import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { TeacherMapper } from '../mapper/teacher.mapper';
import { TeacherFilterParams } from 'apps/server/src/domain/application/repositories/teacher.repository';
@singleton()
export class TeacherRepository implements ITeacherRepository {
  async create(teacher: TeacherEntity, seriesIds: string[]): Promise<boolean> {
    try {
      const data = TeacherMapper.toDatabase(teacher);

      await prisma.teacher.create({
        data: {
          ...data,
          qualified: {
            create: seriesIds.map((seriesId) => ({
              seriesId: seriesId,
            })),
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating teacher:', error);
      return false;
    }
  }

  async findByEmail(email: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return null;
    return TeacherMapper.toDomain(teacher);
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return null;
    return TeacherMapper.toDomain(teacher);
  }

  async findMany({ page, query, status }: TeacherFilterParams): Promise<TeacherEntity[]> {
    const teachers = await prisma.teacher.findMany({
      where: {
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        status: status && status !== 'ALL' ? status : undefined,
      },
      take: 20,
      skip: (page - 1) * 20,
      orderBy: { name: 'asc' },
    });
    return teachers.map(TeacherMapper.toDomain);
  }

  async save(teacher: TeacherEntity, seriesIds?: string[]): Promise<boolean> {
    try {
      const data = TeacherMapper.toDatabase(teacher);

      const qualifiedUpdate = seriesIds ? {
        deleteMany: {},
        create: seriesIds.map((seriesId) => ({ seriesId })),
      } : undefined;

      await prisma.teacher.update({
        where: { id: teacher.id.toString() },
        data: {
          ...data,
          qualified: qualifiedUpdate,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return false;
    }
  }

  async findByTaxId(taxId: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { taxId } });
    if (!teacher) return null;
    return TeacherMapper.toDomain(teacher);
  }
}
