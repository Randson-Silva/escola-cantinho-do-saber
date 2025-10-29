import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';
import { StudentSchema } from '../schemas/student.schema';

export class StudentMapper {
  static toDomain(raw: StudentSchema): StudentEntity {
    return StudentEntity.create(
      {
        birthDate: raw.birthDate,
        classId: raw.classId,
        name: raw.name,
        seriesId: raw.seriesId!.valueOf(),
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: StudentEntity): StudentSchema {
    return {
      id: entity.id.toString(),
      birthDate: entity.birthDate,
      classId: entity.classId,
      name: entity.name,
      seriesId: entity.seriesId,
    };
  }
}
