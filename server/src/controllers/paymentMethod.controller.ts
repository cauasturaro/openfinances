import { Request, Response } from 'express';
import { PaymentMethodService } from '../services/paymentMethod.service.js';

export class PaymentMethodController {
  async index(req: Request, res: Response) {
    const service = new PaymentMethodService();
    const userId = req.user.id;
    const methods = await service.findAll(userId);
    return res.json(methods);
  }

  async create(req: Request, res: Response) {
    const service = new PaymentMethodService();
    const userId = req.user.id;
    const { name } = req.body;

    const method = await service.create(userId, name);
    return res.status(201).json(method);
  }

  async delete(req: Request, res: Response) {
    const service = new PaymentMethodService();
    const userId = req.user.id;
    const paymentMethodId = parseInt(req.params.id, 10);

    await service.deleteById(userId, paymentMethodId);
    return res.status(204).send();
  }
}