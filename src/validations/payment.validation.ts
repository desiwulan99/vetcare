import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const createPaymentSchema = z.object({
  body: z.object({
    appointmentId: z.number({ required_error: 'Appointment ID is required' }).int().positive('Appointment ID must be a positive integer'),
    amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0'),
    paymentMethod: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(PaymentMethod, {
        errorMap: () => ({ message: 'Payment method must be one of: CASH, TRANSFER, EWALLET' }),
      })
    ),
    paymentStatus: z
      .preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase() : val),
        z.nativeEnum(PaymentStatus)
      )
      .optional(),
    paidAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid paidAt date format' })
      .optional()
      .nullable(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    status: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(PaymentStatus, {
        errorMap: () => ({ message: 'Status must be one of: PENDING, PAID, CANCELLED' }),
      })
    ),
    paidAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid paidAt date format' })
      .optional()
      .nullable(),
  }),
});

export const paymentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});

export const paymentOwnerParamSchema = z.object({
  params: z.object({
    ownerId: z.string().regex(/^\d+$/, 'Owner ID must be an integer'),
  }),
});
