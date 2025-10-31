import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { SerieEntity } from 'apps/server/src/domain/enterprise/entities/serie.entity';
import { SerieSchema } from '../schemas/serie.schema';

export class SerieMapper {
  static toDomain(raw: SerieSchema): SerieEntity {
    return SerieEntity.create(
      {
        name: raw.name,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: SerieEntity): SerieSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
    };
  }
}
