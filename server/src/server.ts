import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get('/', (req, res) => {
  res.send('Working server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

