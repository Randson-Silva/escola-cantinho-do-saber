import { IAddressRepository } from 'apps/server/src/domain/application/repositories/address.repository';
import { AddressEntity } from 'apps/server/src/domain/enterprise/entities/address.entity';
import { prisma } from 'packages/database/src/client';
import { AddressMapper } from '../mapper/address.mapper';
import { singleton } from 'tsyringe';

@singleton()
export class AddressRepository implements IAddressRepository {
  async create(address: AddressEntity): Promise<boolean> {
    try {
      await prisma.address.create({ data: AddressMapper.toDatabase(address) });
      return true;
    } catch (error) {
      console.error('Error creating address:', error);
      return false;
    }
  }

  async update(address: AddressEntity): Promise<boolean> {
    try {
      await prisma.address.update({
        where: { id: address.id.toString() },
        data: AddressMapper.toDatabase(address),
      });
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.address.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  }

  async findById(id: string): Promise<AddressEntity | null> {
    const row = await prisma.address.findUnique({ where: { id } });
    return row ? AddressMapper.toDomain(row) : null;
  }

  async listAll(): Promise<AddressEntity[]> {
    const rows = await prisma.address.findMany();
    return rows.map(AddressMapper.toDomain);
  }

  async findDuplicate(address: AddressEntity): Promise<AddressEntity | null> {
    const row = await prisma.address.findFirst({
      where: {
        street: address.street,
        number: address.number,
        district: address.district,
        complement: address.complement ?? null,
      },
    });
    return row ? AddressMapper.toDomain(row) : null;
  }

  async linkToStudent(addressId: string, studentId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { students: { connect: { id: studentId } } },
      });
    } catch (error) {
      console.error('Error linking address to student:', error);
    }
  }

  async unlinkFromStudent(addressId: string, studentId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { students: { disconnect: { id: studentId } } },
      });
    } catch (error) {
      console.error('Error unlinking address from student:', error);
    }
  }

  async listByStudent(studentId: string) {
    const rows = await prisma.address.findMany({
      where: { students: { some: { id: studentId } } },
    });
    return rows.map((r) => ({ address: AddressMapper.toDomain(r), isPrimary: false }));
  }

  async linkToGuardian(addressId: string, guardianId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { guardians: { connect: { id: guardianId } } },
      });
    } catch (error) {
      console.error('Error linking address to guardian:', error);
    }
  }

  async unlinkFromGuardian(addressId: string, guardianId: string): Promise<void> {
    try {
      await prisma.address.update({
        where: { id: addressId },
        data: { guardians: { disconnect: { id: guardianId } } },
      });
    } catch (error) {
      console.error('Error unlinking address from guardian:', error);
    }
  }

  async listByGuardian(guardianId: string) {
    const rows = await prisma.address.findMany({
      where: { guardians: { some: { id: guardianId } } },
    });
    return rows.map((r) => ({ address: AddressMapper.toDomain(r), isPrimary: false }));
  }
}
