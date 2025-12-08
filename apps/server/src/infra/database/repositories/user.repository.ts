import { prisma } from 'packages/database/src/client';
import { UserMapper } from '../mapper/user.mapper';
import { IUserRepository } from 'apps/server/src/domain/application/repositories/user.repository';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { singleton } from 'tsyringe';

@singleton()
export class UserRepository implements IUserRepository {
  async findAllUsers(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: { profile: true },
    });
    return users.map((user) => UserMapper.toDomain(user));
  }

  async create(user: UserEntity): Promise<boolean> {
    try {
      const raw = UserMapper.toDatabase(user);
      await prisma.user.create({
        data: {
          id: raw.id,
          name: raw.name,
          email: raw.email,
          password: raw.password,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
          profileId: raw.profileId,
          // profile: {
          //   create: {
          //     accessLevel: raw.profileId ? 'COMUM' : 'COMUM', // Ajuste conforme lógica de perfil
          //     // Idealmente o Mapper retornaria o objeto de perfil completo ou ID
          //   },
          // },
        },
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user || user.deletedAt) return null;
    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user || user.deletedAt) return null;
    return UserMapper.toDomain(user);
  }

  async update(userEntity: UserEntity): Promise<boolean> {
    try {
      const raw = UserMapper.toDatabase(userEntity);
      await prisma.user.update({
        where: { id: raw.id },
        data: {
          name: raw.name,
          email: raw.email,
          password: raw.password,
          deletedAt: raw.deletedAt,
        },
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.update({
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
