import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  appointmentIdParamSchema,
  appointmentPetParamSchema,
} from '../validations/appointment.validation';

const router = Router();

router.get('/', (req, res, next) => appointmentController.getAll(req, res, next));
router.get('/pet/:petId', validate(appointmentPetParamSchema), (req, res, next) => appointmentController.getByPetId(req, res, next));
router.get('/:id', validate(appointmentIdParamSchema), (req, res, next) => appointmentController.getById(req, res, next));
router.post('/', validate(createAppointmentSchema), (req, res, next) => appointmentController.create(req, res, next));
router.put('/:id', validate(updateAppointmentSchema), (req, res, next) => appointmentController.update(req, res, next));
router.patch('/:id/status', validate(updateAppointmentStatusSchema), (req, res, next) => appointmentController.updateStatus(req, res, next));

export default router;
