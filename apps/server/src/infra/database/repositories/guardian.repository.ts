import { IGuardianRepository } from 'apps/server/src/domain/application/repositories/guardian.repository';
import { GuardianEntity } from 'apps/server/src/domain/enterprise/entities/guardian.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { GuardianMapper } from '../mapper/guardian.mapper';

@singleton()
export class GuardianRepository implements IGuardianRepository {
  async create(guardianEntity: GuardianEntity): Promise<boolean> {
    try {
      const data = GuardianMapper.toDatabase(guardianEntity);
      await prisma.guardian.create({ data });
      return true;
    } catch (error) {
      console.error('Error creating guardian:', error);
      return false;
    }
  }

  async findById(id: string): Promise<GuardianEntity | null> {
    const guardian = await prisma.guardian.findUnique({ where: { id } });
    if (!guardian) return null;
    return GuardianMapper.toDomain(guardian);
  }

  async findByEmail(email: string): Promise<GuardianEntity | null> {
    if (!email) return null;
    const guardian = await prisma.guardian.findUnique({ where: { email } });
    if (!guardian) return null;
    return GuardianMapper.toDomain(guardian);
  }

  async update(guardianEntity: GuardianEntity): Promise<boolean> {
    try {
      const data = GuardianMapper.toDatabase(guardianEntity);
      await prisma.guardian.update({
        where: { id: guardianEntity.id.toString() },
        data,
      });
      return true;
    } catch (error) {
      console.error('Error updating guardian:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.guardian.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting guardian:', error);
      return false;
    }
  }
}
