import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface PaymentProps {
  enrollmentId: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date | null;
  status: string;
  method?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export class PaymentEntity extends Entity<PaymentProps> {
  get enrollmentId() { return this.props.enrollmentId; }
  get amount() { return this.props.amount; }
  get dueDate() { return this.props.dueDate; }
  get paymentDate() { return this.props.paymentDate; }
  get status() { return this.props.status; }
  get method() { return this.props.method; }
  get createdAt() { return this.props.createdAt; }

  public pay(method: string, date: Date) {
    this.props.status = 'PAID';
    this.props.method = method;
    this.props.paymentDate = date;
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<PaymentProps, 'createdAt' | 'updatedAt' | 'deletedAt' | 'status' | 'enrollmentId'>,
    id?: UniqueEntityId,
  ): PaymentEntity {
    const payment = new PaymentEntity(
      {
        ...props,
        enrollmentId: props.enrollmentId ?? '',
        status: props.status ?? 'PENDING',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return payment;
  }
}
