import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { GuardianEntity } from 'apps/server/src/domain/enterprise/entities/guardian.entity';
import { GuardianSchema } from '../schemas/guardian.schema';

export interface GuardianPersistenceDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  addressIds: string[];
  studentIds: string[];
  createdAt: Date;
  deletedAt: Date | null;
}

export class GuardianMapper {
  static toDomain(raw: GuardianSchema): GuardianEntity {
    return GuardianEntity.create(
      {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        addressIds: raw.addresses?.map((a) => a.id) ?? [],
        // Mapeia IDs da tabela intermediária
        studentIds: raw.students?.map((s) => s.studentId) ?? [],
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: GuardianEntity): GuardianPersistenceDTO {
    return {
      id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      addressIds: entity.addressIds,
      studentIds: entity.studentIds,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
