import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';

export class StudentPresenter {
  static toHTTP(student: StudentEntity) {
    return {
      id: student.id.toString(),
      birthDate: student.birthDate,
      classId: student.classId,
      name: student.name,
      seriesId: student.seriesId,
    };
  }
}
