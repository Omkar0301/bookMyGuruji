import { z } from 'zod';

// ────────────────────────────────────────────────────────────────
// HH:MM time format regex
// ────────────────────────────────────────────────────────────────

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeSlotSchema = z.object({
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:MM format'),
});

// ────────────────────────────────────────────────────────────────
// GET /priests — Search / list
// ────────────────────────────────────────────────────────────────

export const searchPriestsSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    ceremony: z.string().optional(),
    language: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    search: z.string().optional(),
  }),
});

// ────────────────────────────────────────────────────────────────
// GET /priests/nearby — Geo-search
// ────────────────────────────────────────────────────────────────

export const nearbyPriestsSchema = z.object({
  query: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(1).max(500).default(25),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// ────────────────────────────────────────────────────────────────
// GET /priests/:id — Public profile
// ────────────────────────────────────────────────────────────────

export const priestIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Priest profile ID is required'),
  }),
});

// ────────────────────────────────────────────────────────────────
// PUT /priests/profile — Update own profile
// ────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  body: z
    .object({
      bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional(),
      specialisations: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      experience: z.number().min(0, 'Experience cannot be negative').optional(),
      education: z.string().optional(),
      gallery: z.array(z.string().url('Each gallery URL must be valid')).optional(),
      travelRadius: z.number().min(0, 'Travel radius cannot be negative').optional(),
      serviceAreas: z.array(z.string()).optional(),
      isAvailable: z.boolean().optional(),
    })
    .strict(),
});

// ────────────────────────────────────────────────────────────────
// PUT /priests/services — Update services & pricing
// ────────────────────────────────────────────────────────────────

export const updateServicesSchema = z.object({
  body: z
    .object({
      services: z
        .array(
          z.object({
            name: z.string().min(1, 'Service name is required').trim(),
            description: z.string().optional().default(''),
            basePriceINR: z.number().min(0, 'Price cannot be negative'),
            duration: z.number().min(0.5, 'Duration must be at least 30 minutes'),
            includesMaterials: z.boolean().optional().default(false),
          })
        )
        .min(1, 'At least one service is required'),
    })
    .strict(),
});

// ────────────────────────────────────────────────────────────────
// GET /priests/availability/:id — Get available slots
// ────────────────────────────────────────────────────────────────

export const getAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Priest profile ID is required'),
  }),
  query: z.object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fromDate must be YYYY-MM-DD'),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'toDate must be YYYY-MM-DD'),
  }),
});

// ────────────────────────────────────────────────────────────────
// PUT /priests/availability — Update weekly schedule
// ────────────────────────────────────────────────────────────────

export const updateAvailabilitySchema = z.object({
  body: z
    .object({
      weeklySchedule: z
        .array(
          z.object({
            dayOfWeek: z.number().int().min(0, 'Day must be 0–6').max(6, 'Day must be 0–6'),
            slots: z.array(timeSlotSchema).default([]),
          })
        )
        .min(1, 'At least one day is required')
        .max(7, 'Cannot exceed 7 days'),
    })
    .strict(),
});

// ────────────────────────────────────────────────────────────────
// POST /priests/availability/override — Block or open dates
// ────────────────────────────────────────────────────────────────

export const availabilityOverrideSchema = z.object({
  body: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
      type: z.enum(['blocked', 'available'], {
        errorMap: () => ({ message: 'Type must be "blocked" or "available"' }),
      }),
      slots: z.array(timeSlotSchema).optional().default([]),
      reason: z.string().optional().default(''),
    })
    .strict(),
});
