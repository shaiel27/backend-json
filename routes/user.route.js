import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/login', UserController.login);
router.post('/register', UserController.createUser);

router.use(authMiddleware);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

console.log('UserRoutes created successfully');

export default router;