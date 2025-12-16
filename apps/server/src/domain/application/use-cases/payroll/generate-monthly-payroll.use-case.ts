import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { IPayrollRepository, PAYROLL_REPOSITORY_TOKEN } from '../../repositories/payroll.repository';
import { PayrollEntity } from '../../../enterprise/entities/payroll.entity';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

type Request = {
  month: number;
  year: number;
};

type Response = Either<Error, { processedCount: number }>;

@singleton()
export class GenerateMonthlyPayrollUseCase {
  constructor(
    @inject(PAYROLL_REPOSITORY_TOKEN) private payrollRepository: IPayrollRepository,
  ) {}

  async execute({ month, year }: Request): Promise<Response> {
    const financialData = await this.payrollRepository.getFinancialDataForPayroll(month, year);

    let processedCount = 0;

    for (const data of financialData) {
      const grossSalary = data.activeContractsSum * 0.5;

      const collected = data.totalCollected;

      // Se arrecadou menos que o salário, a diferença é prejuízo
      const deficit = collected < grossSalary ? grossSalary - collected : 0;

      const payroll = PayrollEntity.create({
        teacherId: data.teacherId,
        referenceMonth: new Date(year, month - 1, 1),
        grossAmount: grossSalary,
        collectedAmount: collected,
        deficitAmount: deficit,
        status: 'PROCESSED'
      });

      await this.payrollRepository.create(payroll);
      processedCount++;
    }

    if (processedCount === 0 && financialData.length > 0) {
       return fail(new CannotCreateError('Payroll Batch'));
    }

    return succeed({ processedCount });
  }
}
