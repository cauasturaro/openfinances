import { prisma } from '../lib/prisma.js';
import { CreateTransactionInput } from '../schemas/transaction.schema.js';

export class TransactionService {
  async findAll(userId: number) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }, 
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

    return {
      balance: aggregation._sum.amount || 0,
      count: aggregation._count.id,
    };
  }
}