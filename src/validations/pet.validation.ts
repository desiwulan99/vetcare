import { z } from 'zod';
import { Species } from '@prisma/client';

export const createPetSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Pet name is required' }).min(1, 'Pet name cannot be empty'),
    species: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(Species, { errorMap: () => ({ message: 'Species must be one of: CAT, DOG, RABBIT, BIRD, OTHER' }) })
    ),
    breed: z.string({ required_error: 'Breed is required' }).min(1, 'Breed cannot be empty'),
    gender: z.string({ required_error: 'Gender is required' }).min(1, 'Gender cannot be empty'),
    dateOfBirth: z.string({ required_error: 'Date of birth is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format (must be valid date string e.g. YYYY-MM-DD)',
    }),
    weight: z.number({ required_error: 'Weight is required' }).positive('Weight must be greater than 0'),
    ownerId: z.number({ required_error: 'Owner ID is required' }).int().positive('Owner ID must be a positive integer'),
  }),
});

export const updatePetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
  body: z.object({
    name: z.string().min(1, 'Pet name cannot be empty').optional(),
    species: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(Species, { errorMap: () => ({ message: 'Species must be one of: CAT, DOG, RABBIT, BIRD, OTHER' }) }).optional()
    ),
    breed: z.string().min(1, 'Breed cannot be empty').optional(),
    gender: z.string().min(1, 'Gender cannot be empty').optional(),
    dateOfBirth: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .optional(),
    weight: z.number().positive('Weight must be greater than 0').optional(),
    ownerId: z.number().int().positive('Owner ID must be a positive integer').optional(),
  }),
});

export const petIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer'),
  }),
});

export const petOwnerParamSchema = z.object({
  params: z.object({
    ownerId: z.string().regex(/^\d+$/, 'Owner ID must be an integer'),
  }),
});
