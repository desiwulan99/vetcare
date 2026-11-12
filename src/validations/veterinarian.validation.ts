import { z } from 'zod';

export const createVeterinarianSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }).min(2, 'Full name must be at least 2 characters'),
    specialization: z.string({ required_error: 'Specialization is required' }).min(2, 'Specialization must be at least 2 characters'),
    phone: z.string({ required_error: 'Phone number is required' }).min(8, 'Phone number must be at least 8 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
  }),
});

export const updateVeterinarianSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    specialization: z.string().min(2, 'Specialization must be at least 2 characters').optional(),
    phone: z.string().min(8, 'Phone number must be at least 8 characters').optional(),
    email: z.string().email('Invalid email address format').optional(),
  }),
});

export const veterinarianIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});
