import { prisma } from '../lib/prisma.js';

export class CategoryService {
  async findAll(userId: number) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: number, name: string, color?: string) {
    return await prisma.category.create({
      data: {
        name,
        userId,
        color: color ,
      },
    });
  }

  async deleteById(userId: number, categoryId: number) {
    return await prisma.category.deleteMany({
      where: {
        id: categoryId,
        userId,
      },
    });
  }
}