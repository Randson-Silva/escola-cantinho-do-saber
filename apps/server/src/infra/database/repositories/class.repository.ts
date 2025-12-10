import { IClassRepository } from 'apps/server/src/domain/application/repositories/class.repository';
import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { ClassMapper } from '../mapper/class.mapper';
import { ClassSchema } from '../schemas/class.schema';

@singleton()
export class ClassRepository implements IClassRepository {
  async create(classEntity: ClassEntity): Promise<boolean> {
    try {
      const raw = ClassMapper.toDatabase(classEntity);

      await prisma.class.create({
        data: {
          id: raw.id,
          name: raw.name,
          teacherId: raw.teacherId,
          shift: raw.shift,
          grades: raw.grades,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
          students: {
            connect: raw.studentIds?.map((id) => ({ id })) ?? [],
          },
          lessons: {
            connect: raw.lessonIds?.map((id) => ({ id })) ?? [],
          },
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findById(id: string): Promise<ClassEntity | null> {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        lessons: true,
      },
    });
    // Verifica soft delete se necessário, ou retorna mesmo deletado dependendo da regra
    if (!classData || classData.deletedAt) return null;
    return ClassMapper.toDomain(classData as ClassSchema);
  }

  async update(classEntity: ClassEntity): Promise<boolean> {
    try {
      const raw = ClassMapper.toDatabase(classEntity);

      await prisma.class.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          teacherId: raw.teacherId,
          shift: raw.shift,
          grades: raw.grades,
          deletedAt: raw.deletedAt,
          students: {
            set: raw.studentIds?.map((id) => ({ id })),
          },
          lessons: {
            set: raw.lessonIds?.map((id) => ({ id })),
          },
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
      await prisma.class.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
