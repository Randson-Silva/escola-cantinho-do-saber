import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { ContractEntity } from '../../../enterprise/entities/contract.entity';
import { EnrollmentEntity } from '../../../enterprise/entities/enrollment.entity';
import { PaymentEntity } from '../../../enterprise/entities/payment.entity';
import { ContractPricingPolicy } from '../../../enterprise/entities/contract-pricing.policy';
import { CONTRACT_REPOSITORY_TOKEN, IContractRepository } from '../../repositories/contract.repository';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

type Request = {
  studentId: string;
  grade: SchoolGrade;
  durationMinutes: number;
  dueDateDay: number;
  installments?: number; // Opcional, padrão 12
};

type Response = Either<Error, { contractId: string; calculatedValue: number }>;

@singleton()
export class CreateContractUseCase {
  constructor(
    @inject(CONTRACT_REPOSITORY_TOKEN) private contractRepository: IContractRepository,
  ) {}

  async execute({ studentId, grade, durationMinutes, dueDateDay, installments = 12 }: Request): Promise<Response> {

    const monthlyValue = ContractPricingPolicy.calculate(grade, durationMinutes);

    const contract = ContractEntity.create({
      studentId,
      monthlyValue,
      dueDateDay,
      signatureDate: new Date(),
    });

    // Gera Parcelas
    const payments: PaymentEntity[] = [];
    const today = new Date();

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, dueDateDay);

      payments.push(PaymentEntity.create({
        amount: monthlyValue,
        dueDate: dueDate,
        status: 'PENDING'
      }));
    }

    // 4. Cria Entidade Matrícula (Enrollment) contendo os pagamentos
    const enrollment = EnrollmentEntity.create({
      studentId,
      status: 'ACTIVE',
      payments: payments
    });

    const created = await this.contractRepository.create(contract, enrollment);

    if (!created) {
      return fail(new CannotCreateError('Contract and Financial Records'));
    }

    return succeed({
      contractId: contract.id.toString(),
      calculatedValue: monthlyValue
    });
  }
}
