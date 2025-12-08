import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface LessonProps {
  date: Date;
  classId: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export class LessonEntity extends Entity<LessonProps> {
  get date() {
    return this.props.date;
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

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<LessonProps, 'createdAt' | 'deletedAt' | 'startTime' | 'endTime' | 'duration'>,
    id?: UniqueEntityId,
  ): LessonEntity {
    const lessonEntity = new LessonEntity(
      {
        ...props,
        startTime: props.startTime ?? null,
        endTime: props.endTime ?? null,
        duration: props.duration ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return lessonEntity;
  }
}
