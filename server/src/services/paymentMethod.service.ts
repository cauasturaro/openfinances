import { prisma } from '../lib/prisma.js';

export class PaymentMethodService {
  async findAll(userId: number) {
    return await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: number, name: string ) {
    return await prisma.paymentMethod.create({
      data: {
        name,
        userId,
      },
    });
  }
  async deleteById(userId: number, paymentMethodId: number) {
    return await prisma.paymentMethod.deleteMany({
      where: {
        id: paymentMethodId,
        userId,
      },
    });
  }
}