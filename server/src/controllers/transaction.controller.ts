import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';

export class TransactionController {
  async index(req: Request, res: Response) {
    const transactionService = new TransactionService();
    const userId = req.user.id; 

    const transactions = await transactionService.findAll(userId);
    return res.json(transactions);
  }

  async create(req: Request, res: Response) {
    const transactionService = new TransactionService();
    const userId = req.user.id; 

    const transaction = await transactionService.create(userId, req.body);
    return res.status(201).json(transaction);
  }

  async summary(req: Request, res: Response) {
    const transactionService = new TransactionService();
    const userId = req.user.id;

    const summary = await transactionService.getSummary(userId);
    return res.json(summary);
  }

  async delete(req: Request, res: Response) {
    const transactionService = new TransactionService();
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id, 10);

    await transactionService.deleteById(userId, transactionId);
    return res.status(204).send();
  } 
}