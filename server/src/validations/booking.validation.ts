import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    priestId: z.string().length(24, 'Invalid priest ID'),
    ceremony: z.object({
      name: z.string().min(2, 'Ceremony name is required'),
      duration: z.number().min(0.5, 'Duration must be at least 0.5 hours'),
      description: z.string().optional(),
    }),
    scheduledDate: z.string().datetime(),
    scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
    venue: z.object({
      address: z.string().min(5, 'Address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z.string().min(6, 'Pincode is required'),
      coordinates: z.array(z.number()).length(2).optional(),
    }),
    specialRequests: z.string().max(1000).optional(),
    materialsRequired: z.array(z.string()).optional(),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Cancellation reason is required'),
  }),
});

export const declineBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Decline reason is required'),
  }),
});

export const disputeBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Dispute reason is required'),
  }),
});
