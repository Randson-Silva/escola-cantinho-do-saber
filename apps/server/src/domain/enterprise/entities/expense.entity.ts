import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface ExpenseProps {
  description: string;
  amount: number;
  date: Date;
  category: string;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export class ExpenseEntity extends Entity<ExpenseProps> {
  get description() { return this.props.description; }
  get amount() { return this.props.amount; }
  get date() { return this.props.date; }
  get category() { return this.props.category; }
  get createdAt() { return this.props.createdAt; }

  static create(
    props: Optional<ExpenseProps, 'createdAt' | 'updatedAt' | 'deletedAt'>,
    id?: UniqueEntityId,
  ): ExpenseEntity {
    const expense = new ExpenseEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return expense;
  }
}
