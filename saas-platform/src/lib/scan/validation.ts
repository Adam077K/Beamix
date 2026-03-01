import { z } from 'zod/v4'

export const scanStartSchema = z.object({
  website_url: z
    .string()
    .min(1, 'Website URL is required')
    .url('Please enter a valid URL'),
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .max(200, 'Business name is too long'),
  sector: z
    .string()
    .min(1, 'Industry sector is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location is too long'),
})

export type ScanStartInput = z.infer<typeof scanStartSchema>
