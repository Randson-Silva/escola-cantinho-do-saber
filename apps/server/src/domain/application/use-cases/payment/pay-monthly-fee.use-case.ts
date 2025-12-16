import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { IPaymentRepository, PAYMENT_REPOSITORY_TOKEN } from '../../repositories/payment.repository';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';

type Request = {
  paymentId: string;
  method: string;
  paymentDate?: Date;
};

type Response = Either<Error, { paymentId: string }>;

@singleton()
export class PayMonthlyFeeUseCase {
  constructor(
    @inject(PAYMENT_REPOSITORY_TOKEN) private paymentRepository: IPaymentRepository,
  ) {}

  async execute({ paymentId, method, paymentDate }: Request): Promise<Response> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      return fail(new ResourceNotFoundError('Payment'));
    }

    payment.pay(method, paymentDate ?? new Date());

    const saved = await this.paymentRepository.save(payment);

    if (!saved) {
      return fail(new CannotUpdateError('Payment'));
    }

    return succeed({ paymentId: payment.id.toString() });
  }
}
