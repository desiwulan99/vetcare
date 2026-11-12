import { Router } from 'express';
import { ownerController } from '../controllers/owner.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createOwnerSchema,
  updateOwnerSchema,
  ownerIdParamSchema,
} from '../validations/owner.validation';

const router = Router();

router.get('/', (req, res, next) => ownerController.getAll(req, res, next));
router.get('/:id', validate(ownerIdParamSchema), (req, res, next) => ownerController.getById(req, res, next));
router.post('/', validate(createOwnerSchema), (req, res, next) => ownerController.create(req, res, next));
router.put('/:id', validate(updateOwnerSchema), (req, res, next) => ownerController.update(req, res, next));
router.delete('/:id', validate(ownerIdParamSchema), (req, res, next) => ownerController.delete(req, res, next));

export default router;
