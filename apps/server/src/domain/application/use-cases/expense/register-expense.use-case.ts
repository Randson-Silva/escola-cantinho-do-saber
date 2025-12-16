import { Either, fail, succeed } from 'apps/server/src/core/either';
import { inject, singleton } from 'tsyringe';
import { ExpenseEntity } from '../../../enterprise/entities/expense.entity';
import { EXPENSE_REPOSITORY_TOKEN, IExpenseRepository } from '../../repositories/expense.repository';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';

type Request = {
  description: string;
  amount: number;
  date: Date;
  category: string;
};

type Response = Either<Error, { expenseId: string }>;

@singleton()
export class RegisterExpenseUseCase {
  constructor(
    @inject(EXPENSE_REPOSITORY_TOKEN) private expenseRepository: IExpenseRepository,
  ) {}

  async execute({ description, amount, date, category }: Request): Promise<Response> {
    const expense = ExpenseEntity.create({
      description,
      amount,
      date,
      category,
    });

    const created = await this.expenseRepository.create(expense);

    if (!created) {
      return fail(new CannotCreateError('Expense'));
    }

    return succeed({ expenseId: expense.id.toString() });
  }
}
