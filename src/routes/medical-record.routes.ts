import { Router } from 'express';
import { medicalRecordController } from '../controllers/medical-record.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createMedicalRecordSchema,
  medicalRecordIdParamSchema,
  medicalRecordPetParamSchema,
} from '../validations/medical-record.validation';

const router = Router();

router.get('/', (req, res, next) => medicalRecordController.getAll(req, res, next));
router.get('/pet/:petId', validate(medicalRecordPetParamSchema), (req, res, next) => medicalRecordController.getByPetId(req, res, next));
router.get('/:id', validate(medicalRecordIdParamSchema), (req, res, next) => medicalRecordController.getById(req, res, next));
router.post('/', validate(createMedicalRecordSchema), (req, res, next) => medicalRecordController.create(req, res, next));

export default router;
