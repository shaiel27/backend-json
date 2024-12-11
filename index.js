import express from 'express'
import dotenv from 'dotenv';
import userRoutes from './src/routes/user.route.js';
import workerRoutes from './src/routes/worker.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/worker', workerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

