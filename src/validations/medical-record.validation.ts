import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  body: z.object({
    petId: z.number({ required_error: 'Pet ID is required' }).int().positive('Pet ID must be a positive integer'),
    veterinarianId: z.number({ required_error: 'Veterinarian ID is required' }).int().positive('Veterinarian ID must be a positive integer'),
    appointmentId: z.number({ required_error: 'Appointment ID is required' }).int().positive('Appointment ID must be a positive integer'),
    diagnosis: z.string({ required_error: 'Diagnosis is required' }).min(2, 'Diagnosis must be at least 2 characters'),
    symptoms: z.string({ required_error: 'Symptoms is required' }).min(2, 'Symptoms must be at least 2 characters'),
    treatment: z.string({ required_error: 'Treatment is required' }).min(2, 'Treatment must be at least 2 characters'),
    prescription: z.string({ required_error: 'Prescription is required' }).min(2, 'Prescription must be at least 2 characters'),
    notes: z.string().optional().nullable(),
  }),
});

export const medicalRecordIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});

export const medicalRecordPetParamSchema = z.object({
  params: z.object({
    petId: z.string().regex(/^\d+$/, 'Pet ID must be an integer'),
  }),
});
