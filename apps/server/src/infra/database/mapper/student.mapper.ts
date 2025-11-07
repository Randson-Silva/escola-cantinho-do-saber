import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';
import { StudentSchema } from '../schemas/student.schema';
import { AddressEntity } from 'apps/server/src/domain/enterprise/entities/address.entity';

export class StudentMapper {
  static toDomain(raw: StudentSchema): StudentEntity {
    const addresses =
      raw.addresses?.map((addr) =>
        AddressEntity.create(
          {
            district: addr.district,
            number: addr.number,
            street: addr.street,
            complement: addr.complement,
          },
          new UniqueEntityId(addr.id),
        ),
      ) ?? null;

    return StudentEntity.create(
      {
        name: raw.name,
        birthDate: raw.birthDate,
        classId: raw.classId,
        seriesId: raw.seriesId ?? null,
        addresses,
        guardians: raw.guardians?.map((g) => g.guardian.id) ?? null,
        enrollmentIds: raw.enrollments?.map((e) => e.id) ?? null,
        attendanceIds: raw.attendances?.map((a) => a.id) ?? null,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: StudentEntity): StudentSchema {
    return {
      id: entity.id.toString(),
      name: entity.name,
      birthDate: entity.birthDate,
      classId: entity.classId,
      seriesId: entity.seriesId,

      // Addresses (entidade completa)
      addresses: entity.addresses
        ? entity.addresses.map((addr) => ({
            id: addr.id.toString(),
            district: addr.district,
            number: addr.number,
            street: addr.street,
            complement: addr.complement,
            studentId: entity.id.toString(),
          }))
        : [],

      // Guardians (adicionando kinship obrigatório)
      guardians: entity.guardians
        ? entity.guardians.map((guardianId) => ({
            studentId: entity.id.toString(),
            guardianId,
            kinship: null, // campo exigido pelo Prisma
            guardian: { id: guardianId },
          }))
        : [],

      enrollments: entity.enrollmentIds
        ? entity.enrollmentIds.map((enrollmentId) => ({
            id: enrollmentId,
            studentId: entity.id.toString(),
            classId: entity.classId,
            seriesId: entity.seriesId,
            status: 'ACTIVE',
            enrollmentDate: new Date(),
            contractId: 'temp-contract-id', // mock mínimo obrigatório
          }))
        : [],

      attendances: entity.attendanceIds
        ? entity.attendanceIds.map((attendanceId) => ({
            id: attendanceId,
            studentId: entity.id.toString(),
            presenceStatus: 'PRESENT', // campo exigido
          }))
        : [],
    };
  }
}
