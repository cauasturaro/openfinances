import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import { createCategorySchema } from '../schemas/category.schema.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';

const categoryRoutes = Router();
const controller = new CategoryController();

categoryRoutes.use(ensureAuthenticated);

categoryRoutes.get('/', controller.index);
categoryRoutes.post('/', validate(createCategorySchema), controller.create);
categoryRoutes.delete('/:id', controller.delete);

export { categoryRoutes };