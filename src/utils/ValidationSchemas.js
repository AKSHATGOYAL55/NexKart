import { z } from 'zod'

// ─────────────────────────────────────────────────────
// WHAT IS A ZOD SCHEMA?
// ─────────────────────────────────────────────────────

// Zod lets you define validation rules ONCE
// React Hook Form uses this schema to automatically:
// 1. Validate every field
// 2. Show error messages under the right input
// 3. Block form submission until everything is valid

// ─── Login Schema ──────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),

  password: z
    .string()
    .min(1, 'Password is required'),
})

// ─── Register Schema ───────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase and a number'
      ),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  // .refine() lets us validate across multiple fields
  // Here we check confirmPassword matches password
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // error shows under this field
  })