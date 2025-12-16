import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { ContractEntity } from '../../../enterprise/entities/contract.entity';
import { ContractPricingPolicy } from '../../../enterprise/entities/contract-pricing.policy';
import { CONTRACT_REPOSITORY_TOKEN, IContractRepository } from '../../repositories/contract.repository';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

type Request = {
  studentId: string;
  grade: SchoolGrade;
  durationMinutes: number;
  dueDateDay: number;
};

type Response = Either<Error, { contractId: string; calculatedValue: number }>;

@singleton()
export class CreateContractUseCase {
  constructor(
    @inject(CONTRACT_REPOSITORY_TOKEN) private contractRepository: IContractRepository,
  ) {}

  async execute({ studentId, grade, durationMinutes, dueDateDay }: Request): Promise<Response> {
    const monthlyValue = ContractPricingPolicy.calculate(grade, durationMinutes);

    const contract = ContractEntity.create({
      studentId,
      monthlyValue,
      dueDateDay,
      signatureDate: new Date(),
    });

    const created = await this.contractRepository.create(contract);

    if (!created) {
      return fail(new CannotCreateError('Contract'));
    }

    return succeed({
      contractId: contract.id.toString(),
      calculatedValue: monthlyValue
    });
  }
}
