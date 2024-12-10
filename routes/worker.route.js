// worker.route.js

import express from 'express';
import { WorkerController } from '../controllers/worker.controller.js';
import { authMiddleware } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/login', WorkerController.login);

router.use(authMiddleware);

router.get('/:id', WorkerController.getWorkerById);
router.get('/email/:email', WorkerController.getWorkerByEmail);
router.get('/appointments', WorkerController.getWorkerAppointments);
router.get('/schedule', WorkerController.getWorkerSchedule);

console.log('WorkerRoutes created successfully');

export default router;