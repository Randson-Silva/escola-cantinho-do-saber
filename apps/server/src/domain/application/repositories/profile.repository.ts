import { ProfileEntity } from '../../enterprise/entities/profile.entity';

export abstract class IProfileRepository {
  abstract create(profileEntity: ProfileEntity): Promise<boolean>;
  abstract findById(id: string): Promise<ProfileEntity | null>;
  abstract findByUserId(id: string): Promise<ProfileEntity | null>;
  abstract findByUserEmail(email: string): Promise<ProfileEntity | null>;
  abstract update(profileEntity: ProfileEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}

export const PROFILE_REPOSITORY_TOKEN = 'IProfileRepository';
