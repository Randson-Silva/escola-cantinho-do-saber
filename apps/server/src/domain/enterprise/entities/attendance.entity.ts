import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface AttendanceProps {
  presenceStatus: string; // ex: "PRESENTE", "AUSENTE", "JUSTIFICADO"
  studentId: string;
}

export class AttendanceEntity extends Entity<AttendanceProps> {
  get presenceStatus() {
    return this.props.presenceStatus;
  }

  get studentId() {
    return this.props.studentId;
  }

  static create(props: AttendanceProps, id?: UniqueEntityId): AttendanceEntity {
    const attendanceEntity = new AttendanceEntity(props, id);
    return attendanceEntity;
  }
}
