import { UserEntity } from 'apps/server/src/core/entities/user';
import { UserSchema } from '../schemas/user.schema';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export class UserMapper {
  static toDomain(raw: UserSchema): UserEntity {
    return UserEntity.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        profileId: raw.profileId,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: UserEntity): UserSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      password: entity.password,
      profileId: entity.profileId,
    };
  }
}
