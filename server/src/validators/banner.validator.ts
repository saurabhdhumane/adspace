import { z } from 'zod';

export const createBannerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['bus_stand', 'hoarding', 'flyover_gantry', 'unipole', 'wall']),
  description: z.string().optional(),
  photos: z
    .array(
      z.object({
        url: z.string().url('Invalid photo URL'),
        thumbnailUrl: z.string().url().optional(),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, 'At least one photo is required'),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    address: z.string().min(3, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    landmark: z.string().optional(),
  }),
  dimensions: z.object({
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
    unit: z.enum(['ft', 'm']).default('ft'),
  }),
  illumination: z.enum(['lit', 'non_lit']),
  trafficNotes: z.string().optional(),
  price: z.object({
    amount: z.number().positive('Price amount must be positive'),
    currency: z.literal('INR').default('INR'),
    per: z.enum(['day', 'week', 'month']).default('month'),
  }),
});

export const updateBannerSchema = createBannerSchema.partial();

export const addSlotSchema = z.object({
  from: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  to: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  note: z.string().optional(),
});
