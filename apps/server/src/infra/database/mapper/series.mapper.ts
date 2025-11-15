import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { SeriesEntity } from 'apps/server/src/domain/enterprise/entities/series.entity';
import { SeriesSchema } from '../schemas/series.schema';

export class SeriesMapper {
  static toDomain(raw: SeriesSchema): SeriesEntity {
    return SeriesEntity.create(
      {
        name: raw.name,
        classIds: raw.classIds ?? null,
        studentIds: raw.studentIds ?? null,
        teacherIds: raw.teacherIds ?? null,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: SeriesEntity): SeriesSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
      classIds: entity.classIds ?? undefined,
      studentIds: entity.studentIds ?? undefined,
      teacherIds: entity.teacherIds ?? undefined,
    };
  }
}
