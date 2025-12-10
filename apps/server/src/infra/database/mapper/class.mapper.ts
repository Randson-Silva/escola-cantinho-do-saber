import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ClassSchema } from '../schemas/class.schema';
import { SchoolGrade, Shift } from 'apps/server/src/core/types/school-enums';

export interface ClassPersistenceDTO {
  id: string;
  name: string;
  teacherId: string;
  shift: Shift;
  grades: SchoolGrade[];
  studentIds: string[];
  lessonIds: string[];
  createdAt: Date;
  deletedAt: Date | null;
}

export class ClassMapper {
  static toDomain(raw: ClassSchema): ClassEntity {
    return ClassEntity.create(
      {
        name: raw.name,
        teacherId: raw.teacherId,
        shift: raw.shift as Shift,
        grades: (raw.grades as SchoolGrade[]) ?? [],
        studentIds: raw.students?.map((s) => s.id) ?? [],
        lessonIds: raw.lessons?.map((l) => l.id) ?? [],
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ClassEntity): ClassPersistenceDTO {
    return {
      id: entity.id.toString(),
      name: entity.name,
      teacherId: entity.teacherId,
      shift: entity.shift,
      grades: entity.grades,
      studentIds: entity.studentIds ?? [],
      lessonIds: entity.lessonIds ?? [],
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
