import { IPaymentRepository } from 'apps/server/src/domain/application/repositories/payment.repository';
import { PaymentEntity } from 'apps/server/src/domain/enterprise/entities/payment.entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';

@singleton()
export class PaymentRepository implements IPaymentRepository {
  async findById(id: string): Promise<PaymentEntity | null> {
    const raw = await prisma.payment.findUnique({ where: { id } });
    if (!raw) return null;

    return PaymentEntity.create({
      enrollmentId: raw.enrollmentId,
      amount: raw.amount,
      dueDate: raw.dueDate,
      status: raw.status,
      paymentDate: raw.paymentDate,
      method: raw.method,
      createdAt: raw.createdAt,
    }, new UniqueEntityId(raw.id));
  }

  async save(payment: PaymentEntity): Promise<boolean> {
    try {
      await prisma.payment.update({
        where: { id: payment.id.toString() },
        data: {
          status: payment.status,
          paymentDate: payment.paymentDate,
          method: payment.method,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findManyByStudentId(studentId: string): Promise<PaymentEntity[]> {
    const rawPayments = await prisma.payment.findMany({
      where: {
        enrollment: {
          studentId: studentId
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return rawPayments.map(raw => PaymentEntity.create({
      enrollmentId: raw.enrollmentId,
      amount: raw.amount,
      dueDate: raw.dueDate,
      status: raw.status,
      paymentDate: raw.paymentDate,
      method: raw.method,
      createdAt: raw.createdAt,
    }, new UniqueEntityId(raw.id)));
  }
}
