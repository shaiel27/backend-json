import express from 'express';
import { WorkerController } from '../controllers/worker.controller.js';
import authMiddleware from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/register', WorkerController.register);
router.post('/login', WorkerController.login);
router.get('/profile', authMiddleware, WorkerController.profile);
router.get('/workers', authMiddleware, WorkerController.getAllWorkers);
router.get('/workers/:id', authMiddleware, WorkerController.getWorkerById);
router.get('/schedule', authMiddleware, WorkerController.getWorkerSchedule);
router.get('/appointments', authMiddleware, WorkerController.getWorkerAppointments);

export default router;

