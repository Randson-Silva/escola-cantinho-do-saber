import { IPayrollRepository, TeacherFinancialData } from 'apps/server/src/domain/application/repositories/payroll.repository';
import { PayrollEntity } from 'apps/server/src/domain/enterprise/entities/payroll.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';

@singleton()
export class PayrollRepository implements IPayrollRepository {
  async create(payroll: PayrollEntity): Promise<boolean> {
    try {
      await prisma.payroll.create({
        data: {
          id: payroll.id.toString(),
          teacherId: payroll.teacherId,
          referenceMonth: payroll.referenceMonth,
          grossAmount: payroll.grossAmount,
          collectedAmount: payroll.collectedAmount,
          deficitAmount: payroll.deficitAmount,
          status: payroll.status,
          processedAt: payroll.processedAt,
          createdAt: payroll.createdAt,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getFinancialDataForPayroll(month: number, year: number): Promise<TeacherFinancialData[]> {
    const teachers = await prisma.teacher.findMany({
      where: { status: 'ACTIVE' },
      include: {
        classes: {
          include: {
            students: {
              include: {
                contracts: {
                  where: { isActive: true }
                },
                enrollments: {
                  include: {
                    payments: {
                      where: {
                        status: 'PAID',
                        paymentDate: {
                          gte: new Date(year, month - 1, 1),
                          lt: new Date(year, month, 1),
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return teachers.map(teacher => {
      let contractsSum = 0;
      let paymentsSum = 0;

      teacher.classes.forEach(cls => {
        cls.students.forEach(student => {
          student.contracts.forEach(contract => {
            contractsSum += contract.monthlyValue;
          });

          student.enrollments.forEach(enrollment => {
            enrollment.payments.forEach(payment => {
              paymentsSum += payment.amount;
            });
          });
        });
      });

      return {
        teacherId: teacher.id,
        activeContractsSum: contractsSum,
        totalCollected: paymentsSum
      };
    });
  }
}
