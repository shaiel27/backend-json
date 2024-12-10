import express from 'express';
import userRoutes from './routes/user.route.js';
import petRoutes from './routes/pet.route.js';
import workerRoutes from './routes/worker.route.js'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/workers',workerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

