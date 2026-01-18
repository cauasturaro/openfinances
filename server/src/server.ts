import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes.js';

const app = express();
const port = process.env.PORT || 3333; 

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

// Rotas
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('OpenFinances\' API is Running');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});