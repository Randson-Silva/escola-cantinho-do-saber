import { UserEntity } from 'apps/server/src/core/entities/user';
import { UserSchema } from '../schemas/user.schema';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ProfileSchema } from '../schemas/profile.schema';
import { ProfileEntity } from 'apps/server/src/domain/enterprise/entities/profile.entity';
import { AccessLevel } from 'apps/server/src/core/types/role';

export interface UserPersistenceDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  profileId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export class UserMapper {
  static toDomain(raw: UserSchema & { profile: ProfileSchema }): UserEntity {
    const profile = ProfileEntity.create(
      {
        accessLevel: raw.profile.accessLevel as AccessLevel,
      },
      new UniqueEntityId(raw.profile.id),
    );

    return UserEntity.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        profile: profile,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: UserEntity): UserPersistenceDTO {
    return {
      id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      password: entity.password,
      profileId: entity.profile.id.toString(),
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
