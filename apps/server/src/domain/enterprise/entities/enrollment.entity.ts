import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';
import { PaymentEntity } from './payment.entity';

export interface EnrollmentProps {
  studentId: string;
  contractId: string;
  status: string;
  enrollmentDate: Date;
  payments: PaymentEntity[];
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export class EnrollmentEntity extends Entity<EnrollmentProps> {
  get studentId() { return this.props.studentId; }
  get contractId() { return this.props.contractId; }
  get status() { return this.props.status; }
  get enrollmentDate() { return this.props.enrollmentDate; }
  get payments() { return this.props.payments; }
  get createdAt() { return this.props.createdAt; }

  static create(
    props: Optional<EnrollmentProps, 'createdAt' | 'updatedAt' | 'deletedAt' | 'contractId' | 'status' | 'enrollmentDate' | 'payments'>,
    id?: UniqueEntityId,
  ): EnrollmentEntity {
    const enrollment = new EnrollmentEntity(
      {
        ...props,
        contractId: props.contractId ?? '',
        status: props.status ?? 'ACTIVE',
        enrollmentDate: props.enrollmentDate ?? new Date(),
        payments: props.payments ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return enrollment;
  }
}
