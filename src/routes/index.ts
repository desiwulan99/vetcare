import { Router } from 'express';
import ownerRoutes from './owner.routes';
import petRoutes from './pet.routes';
import veterinarianRoutes from './veterinarian.routes';
import appointmentRoutes from './appointment.routes';
import medicalRecordRoutes from './medical-record.routes';
import paymentRoutes from './payment.routes';

const apiRouter = Router();

apiRouter.use('/owners', ownerRoutes);
apiRouter.use('/pets', petRoutes);
apiRouter.use('/veterinarians', veterinarianRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/medical-records', medicalRecordRoutes);
apiRouter.use('/payments', paymentRoutes);

export default apiRouter;
