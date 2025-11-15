import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export class ClassMapper {
  static toDomain(raw: any): ClassEntity {
    return ClassEntity.create(
      {
        name: raw.name,
        teacherId: raw.teacherId,
        seriesIds: raw.series?.map((s: any) => s.seriesId) ?? [],
        studentIds: raw.students?.map((s: any) => s.id) ?? [],
        lessonIds: raw.lessons?.map((l: any) => l.id) ?? [],
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ClassEntity): any {
    const base = {
      id: entity.id.toString(),
      name: entity.name,
      teacherId: entity.teacherId,
    };

    const data: any = { ...base };

    // Se for criar a turma do zero
    if (entity.seriesIds && entity.seriesIds.length > 0) {
      data.series = {
        connect: entity.seriesIds.map((id) => ({ seriesId: id })),
      };
    }

    if (entity.studentIds && entity.studentIds.length > 0) {
      data.students = {
        connect: entity.studentIds.map((id) => ({ id })),
      };
    }

    if (entity.lessonIds && entity.lessonIds.length > 0) {
      data.lessons = {
        connect: entity.lessonIds.map((id) => ({ id })),
      };
    }

    return data;
  }
}
