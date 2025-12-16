import { Either, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { IPaymentRepository, PAYMENT_REPOSITORY_TOKEN } from '../../repositories/payment.repository';

type Request = {
  studentId: string;
};

type Response = Either<Error, {
  payments: {
    id: string;
    amount: number;
    dueDate: Date;
    status: string;
    paymentDate?: Date | null;
  }[]
}>;

@singleton()
export class FetchStudentPaymentsUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepository: IPaymentRepository,
  ) {}

  async execute({ studentId }: Request): Promise<Response> {
    const payments = await this.paymentRepository.findManyByStudentId(studentId);

    const formattedPayments = payments.map(p => ({
      id: p.id.toString(),
      amount: p.amount,
      dueDate: p.dueDate,
      status: p.status,
      paymentDate: p.paymentDate
    }));

    return succeed({ payments: formattedPayments });
  }
}
