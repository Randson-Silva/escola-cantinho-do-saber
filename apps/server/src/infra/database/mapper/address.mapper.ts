import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AddressEntity } from 'apps/server/src/domain/enterprise/entities/address.entity';
import { AddressSchema } from '../schemas/address.schema';

export interface AddressPersistenceDTO {
  id: string;
  street: string;
  number: string;
  district: string;
  complement: string | null;
  city: string | null;
  state: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  studentIds: string[];
  guardianIds: string[];
}

export class AddressMapper {
  static toDomain(raw: AddressSchema): AddressEntity {
    return AddressEntity.create(
      {
        street: raw.street,
        number: raw.number,
        district: raw.district,
        complement: raw.complement,
        city: raw.city,
        state: raw.state,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        studentIds: raw.students?.map((s) => s.id) ?? [],
        guardianIds: raw.guardians?.map((g) => g.id) ?? [],
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: AddressEntity): AddressPersistenceDTO {
    return {
      id: entity.id.toString(),
      street: entity.street,
      number: entity.number,
      district: entity.district,
      complement: entity.complement ?? null,
      city: entity.city,
      state: entity.state,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      studentIds: entity.studentIds,
      guardianIds: entity.guardianIds,
    };
  }
}
