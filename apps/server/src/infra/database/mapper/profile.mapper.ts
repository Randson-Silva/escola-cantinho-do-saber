import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ProfileSchema } from '../schemas/profile.schema';
import { ProfileEntity } from 'apps/server/src/domain/enterprise/entities/profile.entity';

export class ProfileMapper {
  static toDomain(raw: ProfileSchema): ProfileEntity {
    return ProfileEntity.create(
      {
        accessLevel: raw.accessLevel,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ProfileEntity): ProfileSchema {
    return {
      id: entity.id.toString(),
      accessLevel: entity.accessLevel
    };
  }
}
