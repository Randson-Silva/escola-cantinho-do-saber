import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';
import { AttendanceStatus } from 'apps/server/src/core/types/school-enums';

export interface AttendanceProps {
  presenceStatus: AttendanceStatus;
  studentId: string;
  lessonId: string;

  createdAt: Date;
  deletedAt: Date | null;
}

export class AttendanceEntity extends Entity<AttendanceProps> {
  get presenceStatus() {
    return this.props.presenceStatus;
  }

  set presenceStatus(presenceStatus: AttendanceStatus) {
    this.props.presenceStatus = presenceStatus;
  }

  get studentId() {
    return this.props.studentId;
  }

  get lessonId() {
    return this.props.lessonId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<AttendanceProps, 'createdAt' | 'deletedAt'>,
    id?: UniqueEntityId,
  ): AttendanceEntity {
    const attendanceEntity = new AttendanceEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return attendanceEntity;
  }
}
