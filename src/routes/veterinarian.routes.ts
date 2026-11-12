import { Router } from 'express';
import { veterinarianController } from '../controllers/veterinarian.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createVeterinarianSchema,
  updateVeterinarianSchema,
  veterinarianIdParamSchema,
} from '../validations/veterinarian.validation';

const router = Router();

router.get('/', (req, res, next) => veterinarianController.getAll(req, res, next));
router.get('/:id', validate(veterinarianIdParamSchema), (req, res, next) => veterinarianController.getById(req, res, next));
router.post('/', validate(createVeterinarianSchema), (req, res, next) => veterinarianController.create(req, res, next));
router.put('/:id', validate(updateVeterinarianSchema), (req, res, next) => veterinarianController.update(req, res, next));
router.delete('/:id', validate(veterinarianIdParamSchema), (req, res, next) => veterinarianController.delete(req, res, next));

export default router;
