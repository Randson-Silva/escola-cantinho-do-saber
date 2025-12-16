import { IContractRepository } from 'apps/server/src/domain/application/repositories/contract.repository';
import { ContractEntity } from 'apps/server/src/domain/enterprise/entities/contract.entity';
import { EnrollmentEntity } from 'apps/server/src/domain/enterprise/entities/enrollment.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';

@singleton()
export class ContractRepository implements IContractRepository {
  async create(contract: ContractEntity, initialEnrollment?: EnrollmentEntity): Promise<boolean> {
    try {
      if (!contract.studentId) throw new Error('Student ID required');

      const enrollmentData = initialEnrollment ? {
        create: {
          id: initialEnrollment.id.toString(),
          status: initialEnrollment.status,
          enrollmentDate: initialEnrollment.enrollmentDate,
          createdAt: initialEnrollment.createdAt,
          student: {
            connect: { id: contract.studentId }
          },
          payments: {
            create: initialEnrollment.payments.map(p => ({
              id: p.id.toString(),
              amount: p.amount,
              dueDate: p.dueDate,
              status: p.status,
              createdAt: p.createdAt
            }))
          }
        }
      } : undefined;

      await prisma.contract.create({
        data: {
          id: contract.id.toString(),
          student: {
            connect: { id: contract.studentId }
          },
          monthlyValue: contract.monthlyValue,
          dueDateDay: contract.dueDateDay,
          signatureDate: contract.signatureDate,
          isActive: contract.isActive,
          documentUrl: contract.documentUrl,
          enrollments: enrollmentData
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating contract transaction:', error);
      return false;
    }
  }

  async findById(id: string): Promise<ContractEntity | null> {
    const raw = await prisma.contract.findUnique({ where: { id } });
    if (!raw) return null;

    return ContractEntity.create({
        studentId: raw.studentId,
        monthlyValue: raw.monthlyValue,
        dueDateDay: raw.dueDateDay,
        signatureDate: raw.signatureDate,
        documentUrl: raw.documentUrl,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
    }, undefined);
  }
}
