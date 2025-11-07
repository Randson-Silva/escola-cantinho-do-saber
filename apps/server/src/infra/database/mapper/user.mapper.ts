import { UserEntity } from 'apps/server/src/core/entities/user';
import { UserSchema } from '../schemas/user.schema';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ProfileSchema } from '../schemas/profile.schema';
import { ProfileEntity } from 'apps/server/src/domain/enterprise/entities/profile.entity';

export class UserMapper {
  static toDomain(raw: UserSchema & { profile: ProfileSchema }): UserEntity {
    const profile = ProfileEntity.create(
      {
        accessLevel: raw.profile.accessLevel,
      },
      new UniqueEntityId(raw.profile.id),
    );

    return UserEntity.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        profile: profile,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: UserEntity): UserSchema {
    const profileId = entity.profile.id.toString();
    return {
      id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      password: entity.password,
      profileId: profileId,
    };
  }
}
