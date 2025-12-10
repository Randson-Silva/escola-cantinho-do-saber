import { IAddressRepository } from 'apps/server/src/domain/application/repositories/address.repository';
import { AddressEntity } from 'apps/server/src/domain/enterprise/entities/address.entity';
import { prisma } from 'packages/database/src/client';
import { AddressMapper } from '../mapper/address.mapper';
import { singleton } from 'tsyringe';
import { AddressSchema } from '../schemas/address.schema';

@singleton()
export class AddressRepository implements IAddressRepository {
  async create(address: AddressEntity): Promise<boolean> {
    try {
      const { studentIds, guardianIds, ...raw } = AddressMapper.toDatabase(address);

      await prisma.address.create({
        data: {
          ...raw,

          students:
            studentIds && studentIds.length > 0
              ? { connect: studentIds.map((id) => ({ id })) }
              : undefined,

          guardians:
            guardianIds && guardianIds.length > 0
              ? { connect: guardianIds.map((id) => ({ id })) }
              : undefined,
        },
      });
      return true;
    } catch (error) {
      console.error('[AddressRepository] Create Error:', error);
      return false;
    }
  }

  async update(address: AddressEntity): Promise<boolean> {
    try {
      const { studentIds, guardianIds, ...raw } = AddressMapper.toDatabase(address);

      await prisma.address.update({
        where: { id: address.id.toString() },
        data: {
          ...raw,
          students: {
            set: studentIds?.map((id) => ({ id })) ?? [],
          },
          guardians: {
            set: guardianIds?.map((id) => ({ id })) ?? [],
          },
        },
      });
      return true;
    } catch (error) {
      console.error('[AddressRepository] Update Error:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.address.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findById(id: string): Promise<AddressEntity | null> {
    const row = await prisma.address.findUnique({ where: { id } });
    return row ? AddressMapper.toDomain(row as AddressSchema) : null;
  }

  async listAll(): Promise<AddressEntity[]> {
    const rows = await prisma.address.findMany({ where: { deletedAt: null } });
    return rows.map((r) => AddressMapper.toDomain(r as AddressSchema));
  }

  async findDuplicate(address: AddressEntity): Promise<AddressEntity | null> {
    const row = await prisma.address.findFirst({
      where: {
        street: address.street,
        number: address.number,
        district: address.district,
        complement: address.complement ?? null,
        city: address.city ?? null,
        state: address.state ?? null,
        deletedAt: null,
      },
    });
    return row ? AddressMapper.toDomain(row as AddressSchema) : null;
  }

  async linkToStudent(addressId: string, studentId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { students: { connect: { id: studentId } } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async unlinkFromStudent(addressId: string, studentId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { students: { disconnect: { id: studentId } } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async listByStudent(studentId: string) {
    const rows = await prisma.address.findMany({
      where: {
        students: { some: { id: studentId } },
        deletedAt: null,
      },
    });
    return rows.map((r) => ({
      address: AddressMapper.toDomain(r as AddressSchema),
      isPrimary: false,
    }));
  }

  async linkToGuardian(addressId: string, guardianId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { guardians: { connect: { id: guardianId } } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async unlinkFromGuardian(addressId: string, guardianId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { guardians: { disconnect: { id: guardianId } } },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async listByGuardian(guardianId: string) {
    const rows = await prisma.address.findMany({
      where: {
        guardians: { some: { id: guardianId } },
        deletedAt: null,
      },
    });
    return rows.map((r) => ({
      address: AddressMapper.toDomain(r as AddressSchema),
      isPrimary: false,
    }));
  }
}
