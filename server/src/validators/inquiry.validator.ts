import { z } from 'zod';

export const createInquirySchema = z.object({
  bannerId: z.string().min(1, 'Banner ID is required'),
  requestedRange: z.object({
    from: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
    to: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  }),
  message: z.string().optional(),
});

export const respondInquirySchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  ownerResponse: z.string().optional(),
});
