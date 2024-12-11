import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', authMiddleware, UserController.profile);
router.get('/users', authMiddleware, UserController.getAllUsers);
router.get('/users/:id', authMiddleware, UserController.getUserById);

export default router;

