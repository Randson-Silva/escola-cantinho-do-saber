import { AddressEntity } from '../../enterprise/entities/address.entity';

export const ADDRESS_REPOSITORY_TOKEN = 'ADDRESS_REPOSITORY_TOKEN';

export interface AddressRepository {
  create(address: AddressEntity): Promise<void>;
  update(address: AddressEntity): Promise<void>;
  softDelete(id: string): Promise<void>;
  findById(id: string): Promise<AddressEntity | null>;
  listAll(): Promise<AddressEntity[]>;

  linkToStudent(addressId: string, studentId: string, isPrimary?: boolean): Promise<void>;
  unlinkFromStudent(addressId: string, studentId: string): Promise<void>;
  listByStudent(studentId: string): Promise<{ address: AddressEntity; isPrimary: boolean }[]>;

  linkToGuardian(addressId: string, guardianId: string, isPrimary?: boolean): Promise<void>;
  unlinkFromGuardian(addressId: string, guardianId: string): Promise<void>;
  listByGuardian(guardianId: string): Promise<{ address: AddressEntity; isPrimary: boolean }[]>;
}