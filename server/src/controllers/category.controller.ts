import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';

export class CategoryController {
  async index(req: Request, res: Response) {
    const categoryService = new CategoryService();
    const userId = Number(req.headers['userid']) || 1; 

    const categories = await categoryService.findAll(userId);
    return res.json(categories);
  }

  async create(req: Request, res: Response) {
    const categoryService = new CategoryService();
    const userId = Number(req.headers['userid']) || 1;
    const { name } = req.body;

    const category = await categoryService.create(userId, name);
    return res.status(201).json(category);
  }
}