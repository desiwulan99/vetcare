import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

export const createAppointmentSchema = z.object({
  body: z.object({
    petId: z.number({ required_error: 'Pet ID is required' }).int().positive('Pet ID must be a positive integer'),
    veterinarianId: z.number({ required_error: 'Veterinarian ID is required' }).int().positive('Veterinarian ID must be a positive integer'),
    appointmentDate: z.string({ required_error: 'Appointment date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format (must be valid date string)',
    }),
    reason: z.string({ required_error: 'Reason is required' }).min(3, 'Reason must be at least 3 characters'),
    notes: z.string().optional(),
    status: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase() : val),
        z.nativeEnum(AppointmentStatus)
      )
      .optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    petId: z.number().int().positive().optional(),
    veterinarianId: z.number().int().positive().optional(),
    appointmentDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .optional(),
    reason: z.string().min(3).optional(),
    status: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase() : val),
        z.nativeEnum(AppointmentStatus)
      )
      .optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    status: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(AppointmentStatus, {
        errorMap: () => ({ message: 'Status must be one of: SCHEDULED, COMPLETED, CANCELLED' }),
      })
    ),
  }),
});

export const appointmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});

export const appointmentPetParamSchema = z.object({
  params: z.object({
    petId: z.string().regex(/^\d+$/, 'Pet ID must be an integer'),
  }),
});
