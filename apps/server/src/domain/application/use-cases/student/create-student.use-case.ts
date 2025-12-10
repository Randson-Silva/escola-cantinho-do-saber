import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import { AddressEntity, AddressProps } from '../../../enterprise/entities/address.entity';
import {
  IGuardianRepository,
  GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/guardian.repository';
import {
  ADDRESS_REPOSITORY_TOKEN,
  IAddressRepository,
} from '../../repositories/address.repository';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';
import { StudentGuardianEntity } from '../../../enterprise/entities/student-guardian.entity';
import {
  IStudentGuardianRepository,
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/student-guardian.repository';

type CreateStudentUseCaseRequest = {
  name: string;
  birthDate: Date;
  classId: string;
  seriesId: string | null;
  studentAddress: AddressProps;
  guardianAddress: AddressProps;
  guardian: {
    name: string;
    kinship: string;
    phones: string[];
    email: string | null;
  };
};

type CreateStudentUseCaseResponse = Either<CannotCreateError, { studentId: string }>;

@singleton()
export class CreateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,

    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: IAddressRepository,

    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,

    @inject(STUDENT_GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianStudentRepository: IStudentGuardianRepository,
  ) {}

  async execute({
    name,
    birthDate,
    classId,
    seriesId,
    studentAddress,
    guardianAddress,
    guardian,
  }: CreateStudentUseCaseRequest): Promise<CreateStudentUseCaseResponse> {
    try {
      const areAddressesEqual = AddressEntity.compareAddresses({
        studentAddress,
        guardianAddress,
      });

      const studentAddressEntity = AddressEntity.create(studentAddress);
      const foundStudentAddress = await this.addressRepository.findDuplicate(studentAddressEntity);
      const finalStudentAddress =
        foundStudentAddress ?? (await this.createAndReturnAddress(studentAddressEntity));

      let finalGuardianAddress = finalStudentAddress;
      if (!areAddressesEqual) {
        const guardianAddressEntity = AddressEntity.create(guardianAddress);
        const foundGuardianAddress =
          await this.addressRepository.findDuplicate(guardianAddressEntity);
        finalGuardianAddress =
          foundGuardianAddress ?? (await this.createAndReturnAddress(guardianAddressEntity));
      }

      const guardianEntity = GuardianEntity.create({
        email: guardian.email,
        name: guardian.name,
        phones: guardian.phones,
      });

      const canCreateGuardian = await this.guardianRepository.create(guardianEntity);
      if (!canCreateGuardian) return fail(new CannotCreateError('Guardian'));

      const studentEntity = StudentEntity.create({
        name,
        birthDate,
        classId,
        seriesId,
        addresses: [finalStudentAddress],
        guardians: [guardianEntity.id.toString()],
        enrollmentIds: [],
        attendanceIds: [],
      });

      const canCreateStudent = await this.studentRepository.create(studentEntity);
      if (!canCreateStudent) return fail(new CannotCreateError('Student'));

      const studentGuardianEntity = StudentGuardianEntity.create({
        guardianId: guardianEntity.id.toString(),
        kinship: guardian.kinship,
        studentId: studentEntity.id.toString(),
      });

      const canCreateGuardianStudent =
        await this.guardianStudentRepository.create(studentGuardianEntity);

      if (!canCreateGuardianStudent) return fail(new CannotCreateError('StudentGuardian'));

      await this.addressRepository.linkToStudent(
        finalStudentAddress.id.toString(),
        studentEntity.id.toString(),
      );

      return succeed({ studentId: studentEntity.id.toString() });
    } catch (error) {
      console.error('Error in CreateStudentUseCase:', error);
      return fail(new Error('Cannot create student due to error: ' + error));
    }
  }

  private async createAndReturnAddress(addressEntity: AddressEntity): Promise<AddressEntity> {
    await this.addressRepository.create(addressEntity);
    const created = await this.addressRepository.findById(addressEntity.id.toString());
    if (!created) throw new Error('Failed to persist address');
    return created;
  }
}
