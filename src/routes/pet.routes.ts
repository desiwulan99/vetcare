import { Router } from 'express';
import { petController } from '../controllers/pet.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createPetSchema,
  updatePetSchema,
  petIdParamSchema,
  petOwnerParamSchema,
} from '../validations/pet.validation';

const router = Router();

router.get('/', (req, res, next) => petController.getAll(req, res, next));
router.get('/owner/:ownerId', validate(petOwnerParamSchema), (req, res, next) => petController.getByOwnerId(req, res, next));
router.get('/:id', validate(petIdParamSchema), (req, res, next) => petController.getById(req, res, next));
router.post('/', validate(createPetSchema), (req, res, next) => petController.create(req, res, next));
router.put('/:id', validate(updatePetSchema), (req, res, next) => petController.update(req, res, next));
router.delete('/:id', validate(petIdParamSchema), (req, res, next) => petController.delete(req, res, next));

export default router;
