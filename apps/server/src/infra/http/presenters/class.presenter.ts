import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';

export class ClassPresenter {
  static toHTTP(classEntity: ClassEntity) {
    return {
      id: classEntity.id.toString(),
      name: classEntity.name,
      teacherId: classEntity.teacherId,
      shift: classEntity.shift,
      grades: classEntity.grades,
      studentIds: classEntity.studentIds,
      lessonIds: classEntity.lessonIds,
      createdAt: classEntity.createdAt,
    };
  }
}
