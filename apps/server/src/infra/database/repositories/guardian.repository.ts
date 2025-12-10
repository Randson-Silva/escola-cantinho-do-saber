import { IGuardianRepository } from 'apps/server/src/domain/application/repositories/guardian.repository';
import { GuardianEntity } from 'apps/server/src/domain/enterprise/entities/guardian.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { GuardianMapper } from '../mapper/guardian.mapper';
import { GuardianSchema } from '../schemas/guardian.schema';

@singleton()
export class GuardianRepository implements IGuardianRepository {
  async create(guardianEntity: GuardianEntity): Promise<boolean> {
    try {
      const raw = GuardianMapper.toDatabase(guardianEntity);

      await prisma.guardian.create({
        data: {
          id: raw.id,
          name: raw.name,
          email: raw.email,
          phone: raw.phone,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
          addresses: raw.addressIds?.length
            ? { connect: raw.addressIds.map((id) => ({ id })) }
            : undefined,
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findById(id: string): Promise<GuardianEntity | null> {
    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: {
        addresses: true,
        students: true,
      },
    });

    if (!guardian) return null;
    return GuardianMapper.toDomain(guardian as GuardianSchema);
  }

  async findByEmail(email: string): Promise<GuardianEntity | null> {
    if (!email) return null;
    const guardian = await prisma.guardian.findUnique({
      where: { email },
      include: {
        addresses: true,
        students: true,
      },
    });

    if (!guardian) return null;
    return GuardianMapper.toDomain(guardian as GuardianSchema);
  }

  async update(guardianEntity: GuardianEntity): Promise<boolean> {
    try {
      const raw = GuardianMapper.toDatabase(guardianEntity);

      await prisma.guardian.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          email: raw.email,
          phone: raw.phone,
          deletedAt: raw.deletedAt,
          addresses: {
            set: raw.addressIds?.map((id) => ({ id })) ?? [],
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
      await prisma.guardian.update({
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
