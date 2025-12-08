import { Entity } from 'apps/server/src/core/entities/entity';
import { Optional } from 'apps/server/src/core/types/optional';
import { Kinship } from 'apps/server/src/core/types/school-enums'; // Importe o Enum

export interface StudentGuardianProps {
  studentId: string;
  guardianId: string;
  kinship: Kinship;

  createdAt: Date;
  deletedAt: Date | null;
}

export class StudentGuardianEntity extends Entity<StudentGuardianProps> {
  get studentId() {
    return this.props.studentId;
  }

  get guardianId() {
    return this.props.guardianId;
  }

  get kinship() {
    return this.props.kinship;
  }

  set kinship(value: Kinship) {
    this.props.kinship = value;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<StudentGuardianProps, 'createdAt' | 'deletedAt'>
  ): StudentGuardianEntity {
    const studentGuardianEntity = new StudentGuardianEntity({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
    return studentGuardianEntity;
  }
}
