import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



import { userRoutes } from './routes/user.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { transactionRoutes } from './routes/transaction.routes.js';
import { paymentMethodRoutes } from './routes/paymentMethod.routes.js';

const app = express();
const port = process.env.PORT || 3333; 

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

// Rotas
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/payment-methods', paymentMethodRoutes);
app.use('/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('OpenFinances\' API is Running');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});