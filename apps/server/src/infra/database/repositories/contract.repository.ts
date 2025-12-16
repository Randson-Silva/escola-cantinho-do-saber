import { IContractRepository } from 'apps/server/src/domain/application/repositories/contract.repository';
import { ContractEntity } from 'apps/server/src/domain/enterprise/entities/contract.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';

@singleton()
export class ContractRepository implements IContractRepository {
  async create(contract: ContractEntity): Promise<boolean> {
    try {
      if (!contract.studentId) throw new Error('Student ID required');

      await prisma.contract.create({
        data: {
          id: contract.id.toString(),
          studentId: contract.studentId,
          monthlyValue: contract.monthlyValue,
          dueDateDay: contract.dueDateDay,
          signatureDate: contract.signatureDate,
          isActive: contract.isActive,
          documentUrl: contract.documentUrl,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
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
