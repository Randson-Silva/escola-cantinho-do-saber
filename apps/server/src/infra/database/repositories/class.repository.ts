import { IClassRepository } from 'apps/server/src/domain/application/repositories/class.repository';
import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { ClassMapper } from '../mapper/class.mapper';

@singleton()
export class ClassRepository implements IClassRepository {
  async create(classEntity: ClassEntity): Promise<boolean> {
    try {
      const classData = ClassMapper.toDatabase(classEntity);
      await prisma.class.create({ data: classData });
      return true;
    } catch (error) {
      console.error('Error creating class:', error);
      return false;
    }
  }

  async findById(id: string): Promise<ClassEntity | null> {
    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) return null;
    return ClassMapper.toDomain(classData);
  }

  async update(classEntity: ClassEntity): Promise<boolean> {
    try {
      const classData = ClassMapper.toDatabase(classEntity);
      await prisma.class.update({
        where: { id: classEntity.id.toString() },
        data: classData,
      });
      return true;
    } catch (error) {
      console.error('Error updating class:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.class.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      return false;
    }
  }
}
