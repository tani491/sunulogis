import { z } from 'zod';

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
  email: z.string().email('Email invalide').max(254),
  fullName: z.string().min(2, 'Nom requis').max(200),
  role: z.enum(['client', 'owner']),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(128),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis').max(128),
  newPassword: passwordSchema,
});

export const establishmentSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  type: z.string().max(50).optional(),
  reference: z.string().max(40).optional().or(z.literal('')),
  slug: z.string().max(120).optional().or(z.literal('')),
  operationType: z.enum(['VENTE', 'LOCATION_MENSUELLE', 'SEJOUR_NUITEE']).optional(),
  priceAmount: z.number().int().positive().nullable().optional(),
  pricePeriod: z.enum(['MOIS', 'NUITEE', 'NONE']).nullable().optional(),
  priceStatus: z.enum(['KNOWN', 'SUR_DEMANDE']).optional(),
  bedrooms: z.number().int().min(0).max(50).nullable().optional(),
  surfaceM2: z.number().int().min(0).max(100000).nullable().optional(),
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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EstablishmentInput = z.infer<typeof establishmentSchema>;
