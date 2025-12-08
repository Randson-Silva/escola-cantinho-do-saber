import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import { AddressEntity } from '../../../enterprise/entities/address.entity';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';
import { StudentGuardianEntity } from '../../../enterprise/entities/student-guardian.entity';

import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import {
  ADDRESS_REPOSITORY_TOKEN,
  IAddressRepository,
} from '../../repositories/address.repository';
import {
  IGuardianRepository,
  GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/guardian.repository';
import {
  IStudentGuardianRepository,
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/student-guardian.repository';

import { Kinship, SchoolGrade } from 'apps/server/src/core/types/school-enums';

type CreateStudentAddress = {
  street: string;
  number: string;
  district: string;
  complement?: string;
  city?: string;
  state?: string;
};

type CreateStudentUseCaseRequest = {
  name: string;
  birthDate: Date;
  classId: string;
  currentGrade: SchoolGrade;
  studentAddress: CreateStudentAddress;
  guardianAddress: CreateStudentAddress;
  guardian: {
    name: string;
    kinship: Kinship;
    phone: string;
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
    private readonly studentGuardianRepository: IStudentGuardianRepository,
  ) {}

  async execute({
    name,
    birthDate,
    classId,
    currentGrade,
    studentAddress,
    guardianAddress,
    guardian,
  }: CreateStudentUseCaseRequest): Promise<CreateStudentUseCaseResponse> {
    try {
      const areAddressesEqual = AddressEntity.compareAddresses({
        studentAddress,
        guardianAddress,
      });

      // Endereço do Aluno
      const studentAddrEntity = AddressEntity.create(studentAddress);
      const existingStudentAddr = await this.addressRepository.findDuplicate(studentAddrEntity);
      const finalStudentAddr =
        existingStudentAddr ?? (await this.createAndReturnAddress(studentAddrEntity));

      // Endereço do Responsável
      let finalGuardianAddr = finalStudentAddr;
      if (!areAddressesEqual) {
        const guardianAddrEntity = AddressEntity.create(guardianAddress);
        const existingGuardianAddr = await this.addressRepository.findDuplicate(guardianAddrEntity);
        finalGuardianAddr =
          existingGuardianAddr ?? (await this.createAndReturnAddress(guardianAddrEntity));
      }

      // Criação Responsável
      const guardianEntity = GuardianEntity.create({
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
      });

      // Conecta endereço ao responsável
      const canCreateGuardian = await this.guardianRepository.create(guardianEntity);
      if (!canCreateGuardian) return fail(new CannotCreateError('Guardian'));

      // Vincula endereço ao responsável recém criado
      await this.addressRepository.linkToGuardian(
        finalGuardianAddr.id.toString(),
        guardianEntity.id.toString(),
      );

      // Criação do Aluno
      const studentEntity = StudentEntity.create({
        name,
        birthDate,
        classId,
        currentGrade,
        addressIds: [finalStudentAddr.id.toString()],
        guardianIds: [],
        enrollmentIds: [],
        attendanceIds: [],
      });

      const canCreateStudent = await this.studentRepository.create(studentEntity);
      if (!canCreateStudent) return fail(new CannotCreateError('Student'));

      // Criação do Vínculo (StudentHasGuardian) com Parentesco
      const linkEntity = StudentGuardianEntity.create({
        studentId: studentEntity.id.toString(),
        guardianId: guardianEntity.id.toString(),
        kinship: guardian.kinship,
      });

      const canCreateLink = await this.studentGuardianRepository.create(linkEntity);
      if (!canCreateLink) return fail(new CannotCreateError('Student-Guardian Link'));

      return succeed({ studentId: studentEntity.id.toString() });
    } catch (error) {
      console.error('Error in CreateStudentUseCase:', error);
      return fail(new Error('Cannot create student due to error: ' + error));
    }
  }

  private async createAndReturnAddress(addressEntity: AddressEntity): Promise<AddressEntity> {
    await this.addressRepository.create(addressEntity);
    // Pequena otimização: se acabou de criar, não precisa buscar no banco se confiar no ID gerado,
    // mas buscar garante que persistiu.
    const created = await this.addressRepository.findById(addressEntity.id.toString());
    if (!created) throw new Error('Failed to persist address');
    return created;
  }
}
