import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';

export class StudentPresenter {
  static toHTTP(student: StudentEntity) {
    return {
      id: student.id.toString(),
      name: student.name,
      birthDate: student.birthDate,
      classId: student.classId,
      currentGrade: student.currentGrade,
      addressIds: student.addressIds,
      guardianIds: student.guardianIds,
      enrollmentIds: student.enrollmentIds,
      attendanceIds: student.attendanceIds,
      createdAt: student.createdAt,
    };
  }
}
