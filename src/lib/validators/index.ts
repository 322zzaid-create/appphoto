import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterInput = z.infer<typeof registerSchema>

export const wallpaperUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1, 'Select at least one category').max(5),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(20),
  device_type: z.enum(['phone', 'desktop', 'tablet', 'all']),
  wallpaper_type: z.enum(['static', 'live']),
  visibility: z.enum(['public', 'private', 'unlisted']),
  is_premium: z.boolean().default(false),
})

export type WallpaperUploadInput = z.infer<typeof wallpaperUploadSchema>

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  orientation: z.enum(['portrait', 'landscape', 'square']).optional(),
  device_type: z.enum(['phone', 'desktop', 'tablet', 'all']).optional(),
  sort_by: z.enum(['newest', 'popular', 'most_downloaded', 'most_liked', 'trending']).optional(),
})

export type SearchInput = z.infer<typeof searchSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30),
  slug: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const settingsSchema = z.object({
  site_name: z.string().min(1).max(50),
  site_description: z.string().max(200),
  maintenance_mode: z.boolean(),
  max_upload_size: z.number().min(1).max(100),
  allowed_file_types: z.array(z.string()).min(1),
  auto_approve_uploads: z.boolean(),
})

export type SettingsInput = z.infer<typeof settingsSchema>

export const studioApplicationSchema = z.object({
  studio_name: z.string().min(2, 'Studio name must be at least 2 characters').max(50),
  studio_description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

export type StudioApplicationInput = z.infer<typeof studioApplicationSchema>

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
})

export type RatingInput = z.infer<typeof ratingSchema>
