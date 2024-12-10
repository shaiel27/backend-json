import express from 'express';
import { PetController } from '../controllers/pet.controller.js';
import { authMiddleware } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', PetController.getAllPets);
router.get('/:id', PetController.getPetById);
router.get('/breed/:breedId', PetController.getPetsByBreed);

console.log('PetRoutes created successfully');

export default router;

