import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface ContractProps {
  studentId: string | null;
  monthlyValue: number;
  signatureDate: Date;
  dueDateDay: number;
  documentUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export class ContractEntity extends Entity<ContractProps> {
  get studentId() { return this.props.studentId; }
  get monthlyValue() { return this.props.monthlyValue; }
  get signatureDate() { return this.props.signatureDate; }
  get dueDateDay() { return this.props.dueDateDay; }
  get documentUrl() { return this.props.documentUrl; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }

  static create(
    props: Optional<ContractProps, 'createdAt' | 'updatedAt' | 'deletedAt' | 'studentId' | 'signatureDate' | 'isActive'>,
    id?: UniqueEntityId,
  ): ContractEntity {
    const contract = new ContractEntity(
      {
        ...props,
        studentId: props.studentId ?? null,
        isActive: props.isActive ?? true,
        signatureDate: props.signatureDate ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return contract;
  }
}
