import { ITeacherRepository } from 'apps/server/src/domain/application/repositories/teacher.repository';
import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { TeacherMapper } from '../mapper/teacher.mapper';

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

  async findByTaxId(taxId: string): Promise<TeacherEntity | null> {
    const teacher = await prisma.teacher.findUnique({ where: { taxId } });
    if (!teacher) return null;
    return TeacherMapper.toDomain(teacher);
  }
}
