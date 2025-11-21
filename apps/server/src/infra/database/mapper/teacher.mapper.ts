import { Teacher } from '@prisma/client';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { TeacherEntity } from 'apps/server/src/domain/enterprise/entities/teacher.entity';

export class TeacherMapper {
  static toDomain(raw: Teacher): TeacherEntity {
    return TeacherEntity.create(
      {
        name: raw.name,
        taxId: raw.taxId,
        phone: raw.phone,
        email: raw.email,
        pixKey: raw.pixKey,
        startDate: raw.startDate,
        status: raw.status,
        expertise: raw.expertise,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: TeacherEntity) {
    return {
      id: entity.id.toString(),
      name: entity.name,
      taxId: entity.taxId,
      phone: entity.phone,
      email: entity.email,
      pixKey: entity.pixKey,
      startDate: entity.startDate,
      status: entity.status,
      expertise: entity.expertise,
    };
  }
}
