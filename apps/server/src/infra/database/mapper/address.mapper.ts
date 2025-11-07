import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AddressEntity } from 'apps/server/src/domain/enterprise/entities/address.entity';
import { AddressSchema } from '../schemas/address.schema';

export class AddressMapper {
  static toDomain(raw: AddressSchema): AddressEntity {
    return AddressEntity.create(
      {
        street: raw.street,
        number: raw.number,
        district: raw.district,
        complement: raw.complement,
        studentIds: raw.students?.map((s) => s.id) ?? null,
        guardianIds: raw.guardians?.map((g) => g.id) ?? null,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: AddressEntity): any {
    return {
      id: entity.id.toString(),
      street: entity.street,
      number: entity.number,
      district: entity.district,
      complement: entity.complement ?? undefined,
      students: entity.studentIds
        ? { connect: entity.studentIds.map((id) => ({ id })) }
        : undefined,
      guardians: entity.guardianIds
        ? { connect: entity.guardianIds.map((id) => ({ id })) }
        : undefined,
    };
  }
}
