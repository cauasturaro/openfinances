import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { validate } from '../middlewares/validate.js';
import { createTransactionSchema } from '../schemas/transaction.schema.js';

const transactionRoutes = Router();
const controller = new TransactionController();

transactionRoutes.get('/', controller.index);
transactionRoutes.get('/summary', controller.summary); // Rota para os cards do dashboard
transactionRoutes.post('/', validate(createTransactionSchema), controller.create);

export { transactionRoutes };