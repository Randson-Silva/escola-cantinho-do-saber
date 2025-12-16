import { PayrollEntity } from '../../enterprise/entities/payroll.entity';

export type TeacherFinancialData = {
  teacherId: string;
  activeContractsSum: number;
  totalCollected: number;
};

export const PAYROLL_REPOSITORY_TOKEN = 'IPayrollRepository';

export abstract class IPayrollRepository {
  abstract create(payroll: PayrollEntity): Promise<boolean>;

  abstract getFinancialDataForPayroll(month: number, year: number): Promise<TeacherFinancialData[]>;
}
