import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema } from '../schemas/category.schema.js';

const categoryRoutes = Router();
const controller = new CategoryController();

categoryRoutes.get('/', controller.index);
categoryRoutes.post('/', validate(createCategorySchema), controller.create);

export { categoryRoutes };