import { prisma } from '../lib/prisma.js';
import { CreateTransactionInput } from '../schemas/transaction.schema.js';

export class TransactionService {
  async findAll(userId: number) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        paymentMethod: { select: { id: true, name: true } },
      }
    });
  }
  
  async create(userId: number, data: CreateTransactionInput) {
      return await prisma.transaction.create({
        data: {
          description: data.description,
          amount: data.amount,
          date: data.date,
          categoryId: data.categoryId,
          paymentMethodId: data.paymentMethodId,
          userId: userId,
        },
      });
    }

  async getSummary(userId: number) {
    const aggregation = await prisma.transaction.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: { id: true },
    });

    const income = await prisma.transaction.aggregate({
      where: { userId, amount: { gt: 0 } },
      _sum: { amount: true }
    });

    const expense = await prisma.transaction.aggregate({
      where: { userId, amount: { lt: 0 } },
      _sum: { amount: true }
    });

    return {
      balance: aggregation._sum.amount || 0,
      count: aggregation._count.id,
      income: income._sum.amount || 0,
      expense: expense._sum.amount || 0
    };
  }

  async deleteById(userId: number, transactionId: number) {
    return await prisma.transaction.deleteMany({
      where: {
        id: transactionId,
        userId,
      },
    });
  }
}