import { Router } from 'express';
import { PaymentMethodController } from '../controllers/paymentMethod.controller.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { validate } from '../middlewares/validate.js';
import { createPaymentMethodSchema } from '../schemas/paymentMethod.schema.js';

const paymentMethodRoutes = Router();
const controller = new PaymentMethodController();

paymentMethodRoutes.use(ensureAuthenticated);

paymentMethodRoutes.get('/', controller.index);
paymentMethodRoutes.post('/', validate(createPaymentMethodSchema), controller.create);
paymentMethodRoutes.delete('/:id', controller.delete); 

export { paymentMethodRoutes };