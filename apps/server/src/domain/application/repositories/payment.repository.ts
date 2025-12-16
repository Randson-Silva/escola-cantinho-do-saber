import { PaymentEntity } from '../../enterprise/entities/payment.entity';

export const PAYMENT_REPOSITORY_TOKEN = 'IPaymentRepository';

export abstract class IPaymentRepository {
  abstract findById(id: string): Promise<PaymentEntity | null>;
  abstract save(payment: PaymentEntity): Promise<boolean>;
  abstract findManyByStudentId(studentId: string): Promise<PaymentEntity[]>;
}
