import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface StudentGuardianProps {
  studentId: string;
  guardianId: string;
  kinship: string | null;
}

export class StudentGuardianEntity {
  protected props: StudentGuardianProps;

  get studentId() {
    return this.props.studentId;
  }

  get guardianId() {
    return this.props.guardianId;
  }

  get kinship() {
    return this.props.kinship;
  }

  protected constructor(props: StudentGuardianProps) {
    this.props = props;
  }

  static create(props: StudentGuardianProps): StudentGuardianEntity {
    const studentGuardianEntity = new StudentGuardianEntity(props);
    return studentGuardianEntity;
  }
}
