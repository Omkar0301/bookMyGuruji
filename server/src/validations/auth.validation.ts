import { z } from 'zod';

/**
 * Zod schemas for authentication request validation.
 */

export const registerSchema = z.object({
  body: z
    .object({
      name: z.object({
        first: z.string().min(1, 'First name is required').max(100),
        last: z.string().min(1, 'Last name is required').max(100),
      }),
      email: z.string().email('Invalid email format'),
      phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      role: z.enum(['user', 'priest']).default('user'),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    })
    .strict(),
});

export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email format'),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Reset token is required'),
  }),
  body: z
    .object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    })
    .strict(),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    })
    .strict(),
});
