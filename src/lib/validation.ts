import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  password: z.string().min(1, 'Mot de passe requis').max(128),
});

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  );

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  fullName: z.string().min(2, "Nom requis"),
  role: z.enum(['client', 'owner', 'admin']),
  password: z.string().optional().or(z.literal('')),
  username: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  // La nouvelle ligne :
  isSubscribed: z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis').max(128),
  newPassword: passwordSchema,
});

// ── Establishments ────────────────────────────────────────────────────────────

export const establishmentSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  type: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  city: z.string().min(1, 'Ville requise').max(100),
  region: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url('URL invalide').max(500).nullable().optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^\+?[\d\s\-()]*$/, 'Numéro de téléphone invalide')
    .nullable()
    .optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EstablishmentInput = z.infer<typeof establishmentSchema>;
