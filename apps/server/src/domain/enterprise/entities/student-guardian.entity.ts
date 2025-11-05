import { Entity } from 'apps/server/src/core/entities/entity';

export interface StudentGuardianProps {
  studentId: string;
  guardianId: string;
  kinship: string | null;
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

  static create(props: StudentGuardianProps): StudentGuardianEntity {
    const studentGuardianEntity = new StudentGuardianEntity(props);
    return studentGuardianEntity;
  }
}
