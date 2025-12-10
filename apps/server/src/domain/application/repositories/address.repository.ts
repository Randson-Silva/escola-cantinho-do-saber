import { AddressEntity } from '../../enterprise/entities/address.entity';

export const ADDRESS_REPOSITORY_TOKEN = 'ADDRESS_REPOSITORY_TOKEN';

export abstract class IAddressRepository {
  abstract create(addressEntity: AddressEntity): Promise<boolean>;
  abstract findById(id: string): Promise<AddressEntity | null>;
  abstract update(addressEntity: AddressEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract listAll(): Promise<AddressEntity[]>;

  abstract findDuplicate(address: AddressEntity): Promise<AddressEntity | null>;

  abstract linkToStudent(addressId: string, studentId: string): Promise<void>;
  abstract unlinkFromStudent(addressId: string, studentId: string): Promise<void>;
  abstract listByStudent(
    studentId: string,
  ): Promise<{ address: AddressEntity; isPrimary: boolean }[]>;

  abstract linkToGuardian(addressId: string, guardianId: string): Promise<void>;
  abstract unlinkFromGuardian(addressId: string, guardianId: string): Promise<void>;
  abstract listByGuardian(
    guardianId: string,
  ): Promise<{ address: AddressEntity; isPrimary: boolean }[]>;
}
