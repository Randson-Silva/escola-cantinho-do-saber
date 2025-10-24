import { prisma } from 'packages/database/src/client';
import { ProfileMapper } from '../mapper/profile.mapper';
import { IProfileRepository } from 'apps/server/src/domain/application/repositories/profile.repository';
import { singleton } from 'tsyringe';
import { ProfileEntity } from 'apps/server/src/domain/enterprise/entities/profile.entity';

@singleton()
export class ProfileRepository implements IProfileRepository {
  async create(profileEntity: ProfileEntity): Promise<boolean> {
    try {
      const profileData = ProfileMapper.toDatabase(profileEntity);
      await prisma.profile.create({ data: profileData });
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  }

  async findById(id: string): Promise<ProfileEntity | null> {
    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return null;
    return ProfileMapper.toDomain(profile);
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return null;

    const profile = await prisma.profile.findUnique({ where: { id: user.profileId } });
    if (!profile) return null;
    return ProfileMapper.toDomain(profile);
  }

  async findByUserEmail(userEmail: string): Promise<ProfileEntity | null> {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) return null;

    const profile = await prisma.profile.findUnique({ where: { id: user.profileId } });
    if (!profile) return null;
    return ProfileMapper.toDomain(profile);
  }

  async update(profileEntity: ProfileEntity): Promise<boolean> {
    try {
      const profileData = ProfileMapper.toDatabase(profileEntity);
      await prisma.profile.update({
        where: { id: profileEntity.id.toString() },
        data: profileData,
      });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.profile.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }
}
