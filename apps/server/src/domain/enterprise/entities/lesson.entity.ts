import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface LessonProps {
  lessonDate: Date;
  classId: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
}

export class LessonEntity extends Entity<LessonProps> {
  get lessonDate() {
    return this.props.lessonDate;
  }

  get classId() {
    return this.props.classId;
  }

  get startTime() {
    return this.props.startTime;
  }

  get endTime() {
    return this.props.endTime;
  }

  get duration() {
    return this.props.duration;
  }

  set lessonDate(value: Date) {
    this.props.lessonDate = value;
  }
  set startTime(value: string | null) {
    this.props.startTime = value;
  }
  set endTime(value: string | null) {
    this.props.endTime = value;
  }
  set duration(value: string | null) {
    this.props.duration = value;
  }

  static create(props: LessonProps, id?: UniqueEntityId): LessonEntity {
    const lessonEntity = new LessonEntity(props, id);
    return lessonEntity;
  }
}
