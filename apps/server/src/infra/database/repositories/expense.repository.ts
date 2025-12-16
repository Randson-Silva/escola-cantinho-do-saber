import { IExpenseRepository } from 'apps/server/src/domain/application/repositories/expense.repository';
import { ExpenseEntity } from 'apps/server/src/domain/enterprise/entities/expense.entity';
import { prisma } from 'packages/database/src/client';
import { ExpenseCategory } from '@prisma/client';
import { singleton } from 'tsyringe';

@singleton()
export class ExpenseRepository implements IExpenseRepository {
  async create(expense: ExpenseEntity): Promise<boolean> {
    try {
      await prisma.expense.create({
        data: {
          id: expense.id.toString(),
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          category: expense.category as ExpenseCategory,
          createdAt: expense.createdAt,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.expense.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
}
