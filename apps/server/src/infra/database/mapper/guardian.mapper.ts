import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { GuardianEntity } from 'apps/server/src/domain/enterprise/entities/guardian.entity';
import { GuardianSchema } from '../schemas/guardian.schema';

export class GuardianMapper {
  static toDomain(raw: GuardianSchema): GuardianEntity {
    return GuardianEntity.create(
      {
        name: raw.name,
        email: raw.email,
        phones: raw.phones,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: GuardianEntity): GuardianSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      phones: entity.phones,
    };
  }
}
