import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';
import { ClassSchema } from '../schemas/class.schema';

export class ClassMapper {
  static toDomain(raw: ClassSchema): ClassEntity {
    return ClassEntity.create(
      {
        name: raw.name,
        teacherId: raw.teacherId,
        // series: raw.series,
        // lessons: raw.lessons,
        // students: raw.students,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ClassEntity): ClassSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
      teacherId: entity.teacherId,
    };
  }
}
