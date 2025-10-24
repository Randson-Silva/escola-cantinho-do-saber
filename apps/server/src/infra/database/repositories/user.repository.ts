import { prisma } from 'packages/database/src/client';
import { UserMapper } from '../mapper/user.mapper';
import { IUserRepository } from 'apps/server/src/domain/application/repositories/user.repository';
import { UserEntity } from 'apps/server/src/core/entities/user';
import { singleton } from 'tsyringe';

@singleton()
export class UserRepository implements IUserRepository {
  async create(userEntity: UserEntity): Promise<boolean> {
    try {
      const userData = UserMapper.toDatabase(userEntity);
      await prisma.user.create({ data: userData });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async update(userEntity: UserEntity): Promise<boolean> {
    try {
      const userData = UserMapper.toDatabase(userEntity);
      await prisma.user.update({
        where: { id: userEntity.id.toString() },
        data: userData,
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}
