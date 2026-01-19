import { api } from "@/lib/api";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: { id: number; name: string; color: string };
  paymentMethod: { id: number; name: string };
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: Date;
  categoryId: number;
  paymentMethodId: number;
}

export interface DashboardSummary {
  balance: number;
  income: number;
  expense: number;
}

export const TransactionService = {
  getAll: async () => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  create: async (data: CreateTransactionDTO) => {
    return await api.post('/transactions', data);
  },

  deleteTransaction: async (id: number) => {
    await api.delete(`/transactions/${id}`);
  },

  calculateSummary: (transactions: Transaction[]): DashboardSummary => {
     let income = 0;
     let expense = 0;

     transactions.forEach(t => {
       if (t.amount > 0) income += t.amount;
       else expense += Math.abs(t.amount);
     });

     return {
       income,
       expense,
       balance: income - expense
     };
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    const response = await api.get<{id: number, name: string, color: string}[]>('/categories');
    return response.data;
  },

  createCategory: async (name: string, color: string) => {
    const response = await api.post('/categories', { name, color });
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },

  // --- PAYMENT METHODS ---
  getPaymentMethods: async () => {
    const response = await api.get<{id: number, name: string}[]>('/payment-methods'); 
    return response.data;
  },

  createPaymentMethod: async (name: string) => {
    const response = await api.post('/payment-methods', { name });
    return response.data;
  },

  deletePaymentMethod: async (id: number) => {
    await api.delete(`/payment-methods/${id}`);
  },
};