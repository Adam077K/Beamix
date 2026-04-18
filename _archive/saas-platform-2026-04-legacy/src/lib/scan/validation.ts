import { z } from 'zod'

export const scanStartSchema = z.object({
  url: z
    .string()
    .min(1, 'Website URL is required')
    .url('Please enter a valid URL')
    .refine(
      (v) => v.startsWith('https://') || v.startsWith('http://'),
      'URL must use http or https'
    ),
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
  email: z.string().email('Please enter a valid email').optional(),
})

export type ScanStartInput = z.infer<typeof scanStartSchema>
