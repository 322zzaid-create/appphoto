import { z } from 'zod'

export const studioApplicationSchema = z.object({
  studio_name: z.string().min(2, 'Studio name must be at least 2 characters').max(50),
  studio_description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

export type StudioApplicationInput = z.infer<typeof studioApplicationSchema>
