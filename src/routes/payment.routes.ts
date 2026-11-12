import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentIdParamSchema,
  paymentOwnerParamSchema,
} from '../validations/payment.validation';

const router = Router();

router.get('/', (req, res, next) => paymentController.getAll(req, res, next));
router.get('/owner/:ownerId', validate(paymentOwnerParamSchema), (req, res, next) => paymentController.getByOwnerId(req, res, next));
router.get('/:id', validate(paymentIdParamSchema), (req, res, next) => paymentController.getById(req, res, next));
router.post('/', validate(createPaymentSchema), (req, res, next) => paymentController.create(req, res, next));
router.patch('/:id/status', validate(updatePaymentStatusSchema), (req, res, next) => paymentController.updateStatus(req, res, next));

export default router;
