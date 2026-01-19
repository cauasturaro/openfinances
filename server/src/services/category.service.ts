import { prisma } from '../lib/prisma.js';

export class CategoryService {
  async findAll(userId: number) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: number, name: string) {
    return await prisma.category.create({
      data: {
        name,
        userId,
      },
    });
  }
}