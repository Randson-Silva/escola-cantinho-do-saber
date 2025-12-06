import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';

export class TeacherPresenter {
  static toHTTP(teacher: TeacherEntity) {
    return {
      id: teacher.id.toString(),
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      taxId: teacher.taxId,
      pixKey: teacher.pixKey,
      status: teacher.status,
      expertise: teacher.expertise,
      startDate: teacher.startDate,
      nextPaymentDate: teacher.getNextPaymentDate(), // Campo calculado (AC 2)
    };
  }
}
