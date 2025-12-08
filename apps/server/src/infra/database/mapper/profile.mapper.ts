import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ProfileSchema } from '../schemas/profile.schema';
import { ProfileEntity } from 'apps/server/src/domain/enterprise/entities/profile.entity';
import { AccessLevel } from 'apps/server/src/core/types/role';

export interface ProfilePersistenceDTO {
  id: string;
  accessLevel: AccessLevel;
}

export class ProfileMapper {
  static toDomain(raw: ProfileSchema): ProfileEntity {
    return ProfileEntity.create(
      {
        accessLevel: raw.accessLevel as AccessLevel,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ProfileEntity): ProfilePersistenceDTO {
    return {
      id: entity.id.toString(),
      accessLevel: entity.accessLevel,
    };
  }
}
