import { ClassEntity } from 'apps/server/src/domain/enterprise/entities/class.entity';

export class ClassPresenter {
  static toHTTP(classEntity: ClassEntity) {
    return {
      name: classEntity.name,
      startTime: classEntity.startTime,
      endTime: classEntity.endTime,
      duration: classEntity.duration,
      teacherId: classEntity.teacherId,
    };
  }
}
