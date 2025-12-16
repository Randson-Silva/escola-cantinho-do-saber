import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface PayrollProps {
  teacherId: string;
  referenceMonth: Date;
  grossAmount: number;
  collectedAmount: number;
  deficitAmount: number;
  status: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export class PayrollEntity extends Entity<PayrollProps> {
  get teacherId() { return this.props.teacherId; }
  get referenceMonth() { return this.props.referenceMonth; }
  get grossAmount() { return this.props.grossAmount; }
  get collectedAmount() { return this.props.collectedAmount; }
  get deficitAmount() { return this.props.deficitAmount; }
  get status() { return this.props.status; }
  get processedAt() { return this.props.processedAt; }
  get createdAt() { return this.props.createdAt; }

  static create(
    props: Optional<PayrollProps, 'createdAt' | 'updatedAt' | 'deletedAt' | 'processedAt' | 'status'>,
    id?: UniqueEntityId,
  ): PayrollEntity {
    const payroll = new PayrollEntity(
      {
        ...props,
        status: props.status ?? 'PROCESSED',
        processedAt: props.processedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return payroll;
  }
}
