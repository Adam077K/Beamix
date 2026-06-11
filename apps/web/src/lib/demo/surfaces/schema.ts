import type { SchemaResult } from './types'

/**
 * DEMO_SCHEMA — Schema Generator fixture data
 * Business: Bright Smile Dental, Ramat Gan
 */
export const DEMO_SCHEMA = {
  results: [
    {
      id: 's1',
      url: 'https://brightsmile-dental.co.il',
      schemaType: 'Dentist',
      validityScore: 74,
      jsonLd: JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Dentist',
          name: 'Bright Smile Dental',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '14 HaArbaa St',
            addressLocality: 'Ramat Gan',
            addressCountry: 'IL',
          },
          telephone: '+972-3-555-0123',
          url: 'https://brightsmile-dental.co.il',
          openingHours: 'Mo-Fr 09:00-19:00',
        },
        null,
        2,
      ),
      missingFields: ['acceptsInsurance', 'priceRange', 'hasMap'],
      published: false,
      publishedAt: null,
    },
  ] as SchemaResult[],
} as const
