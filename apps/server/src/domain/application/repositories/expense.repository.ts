import { ExpenseEntity } from '../../enterprise/entities/expense.entity';

export const EXPENSE_REPOSITORY_TOKEN = 'IExpenseRepository';

export abstract class IExpenseRepository {
  abstract create(expense: ExpenseEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}
