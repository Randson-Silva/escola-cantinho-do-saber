export interface AttendanceLinkedToLessonProps {
  attendanceId: string;
  lessonId: string;
}

export class AttendanceLinkedToLessonEntity {
  protected props: AttendanceLinkedToLessonProps;

  get attendanceId() {
    return this.props.attendanceId;
  }

  get lessonId() {
    return this.props.lessonId;
  }

  protected constructor(props: AttendanceLinkedToLessonProps) {
    this.props = props;
  }

  static create(props: AttendanceLinkedToLessonProps): AttendanceLinkedToLessonEntity {
    const linkEntity = new AttendanceLinkedToLessonEntity(props);
    return linkEntity;
  }
}
