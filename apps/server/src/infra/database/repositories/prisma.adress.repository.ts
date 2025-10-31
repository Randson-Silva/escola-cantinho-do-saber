import { PrismaClient } from '@prisma/client';

import { AddressRepository } from '../../../domain/application/repositories/address.repository';
import { AddressEntity } from '../../../domain/enterprise/entities/address.entity';
import { UniqueEntityId } from '../../../core/entities/unique-entity-id';

const prisma = new PrismaClient();

type PrismaAddress = NonNullable<
  Awaited<ReturnType<typeof prisma.address.findFirst>>
>;

const toDomain = (a: PrismaAddress): AddressEntity =>
  AddressEntity.create(
    { street: a.street, number: a.number, district: a.district, complement: a.complement },
    new UniqueEntityId(a.id)
  );

export class PrismaAddressRepository implements AddressRepository {
  async create(address: AddressEntity): Promise<void> {
    await prisma.address.create({
      data: {
        id: address.id.toString(),
        street: address.street,
        number: address.number,
        district: address.district,
        complement: address.complement ?? undefined,
      },
    });
  }

  async update(address: AddressEntity): Promise<void> {
    await prisma.address.update({
      where: { id: address.id.toString() },
      data: {
        street: address.street,
        number: address.number,
        district: address.district,
        complement: address.complement ?? undefined,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } });
  }

  async findById(id: string): Promise<AddressEntity | null> {
    const row = await prisma.address.findFirst({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async listAll(): Promise<AddressEntity[]> {
    const rows = await prisma.address.findMany();
    return rows.map(toDomain);
  }

  async linkToStudent(addressId: string, studentId: string, _isPrimary = false): Promise<void> {
    await prisma.address.update({
      where: { id: addressId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
    });
  }

  async unlinkFromStudent(addressId: string, studentId: string): Promise<void> {
    await prisma.address.update({
      where: { id: addressId },
      data: {
        students: {
          disconnect: { id: studentId },
        },
      },
    });
  }

  async listByStudent(studentId: string) {
    const rows = await prisma.address.findMany({
      where: { students: { some: { id: studentId } } },
    });
    return rows.map((r) => ({ address: toDomain(r as PrismaAddress), isPrimary: false }));
  }

  async linkToGuardian(addressId: string, guardianId: string, _isPrimary = false): Promise<void> {
    await prisma.address.update({
      where: { id: addressId },
      data: {
        guardians: {
          connect: { id: guardianId },
        },
      },
    });
  }

  async unlinkFromGuardian(addressId: string, guardianId: string): Promise<void> {
    await prisma.address.update({
      where: { id: addressId },
      data: {
        guardians: {
          disconnect: { id: guardianId },
        },
      },
    });
  }

  async listByGuardian(guardianId: string) {
    const rows = await prisma.address.findMany({
      where: { guardians: { some: { id: guardianId } } },
    });
    return rows.map((r) => ({ address: toDomain(r as PrismaAddress), isPrimary: false }));
  }
}
