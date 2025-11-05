import { StudentGuardianEntity } from 'apps/server/src/domain/enterprise/entities/student-guardian.entity';
import { StudentGuardianSchema } from '../schemas/student-guardian.schema'; // (Crie este arquivo primeiro, como no Passo 5 original)

export class StudentGuardianMapper {
  static toDomain(raw: StudentGuardianSchema): StudentGuardianEntity {
    return StudentGuardianEntity.create({
      studentId: raw.studentId,
      guardianId: raw.guardianId,
      kinship: raw.kinship,
    });
  }

  static toDatabase(entity: StudentGuardianEntity): StudentGuardianSchema {
    return {
      studentId: entity.studentId,
      guardianId: entity.guardianId,
      kinship: entity.kinship,
    };
  }
}
