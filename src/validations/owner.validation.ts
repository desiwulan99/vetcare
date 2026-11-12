import { z } from 'zod';

export const createOwnerSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }).min(2, 'Full name must be at least 2 characters'),
    phone: z.string({ required_error: 'Phone number is required' }).min(8, 'Phone number must be at least 8 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    address: z.string({ required_error: 'Address is required' }).min(5, 'Address must be at least 5 characters'),
  }),
});

export const updateOwnerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    phone: z.string().min(8, 'Phone number must be at least 8 characters').optional(),
    email: z.string().email('Invalid email address format').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  }),
});

export const ownerIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});
