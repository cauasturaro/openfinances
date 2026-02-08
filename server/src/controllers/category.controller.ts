import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';

const categoryService = new CategoryService();

export class CategoryController {
  async index(req: Request, res: Response) {
    const userId = req.user.id;

    const categories = await categoryService.findAll(userId);
    return res.json(categories);
  }

  async create(req: Request, res: Response) {
    const userId = req.user.id;
    const { name, color } = req.body;

    const category = await categoryService.create(userId, name, color);
    return res.status(201).json(category);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user.id;
    const categoryId = parseInt(req.params.id, 10);

    await categoryService.deleteById(userId, categoryId);
    return res.status(204).send();
  }
}