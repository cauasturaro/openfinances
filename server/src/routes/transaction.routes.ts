import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { createTransactionSchema } from '../schemas/transaction.schema.js';
import { TransactionController } from '../controllers/transaction.controller.js';

const transactionRoutes = Router();
const controller = new TransactionController();

transactionRoutes.use(ensureAuthenticated);

transactionRoutes.get('/', controller.index);
transactionRoutes.get('/summary', controller.summary);
transactionRoutes.post('/', validate(createTransactionSchema), controller.create);
transactionRoutes.delete('/:id', controller.delete);

export { transactionRoutes };