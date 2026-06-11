import type { SchemaResult } from './types'

/**
 * DEMO_SCHEMA — Schema Generator fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * The populated result is rich enough to feel real:
 * - acceptsInsurance, priceRange, areaServed (Ramat Gan locale)
 * - 9/9 valid fields for the ContextStat hero figure
 * - published: true (auto-publish path, no /approvals gate)
 */
export const DEMO_SCHEMA = {
  /** Validity history — last 5 runs for sparkline (most-recent last). */
  validityHistory: [62, 68, 71, 74, 100],

  /** Counter state for today's runs (cap 20, all tiers). */
  runsToday: 3,
  dailyCap: 20,

  results: [
    {
      id: 's1',
      url: 'https://brightsmile-dental.co.il',
      schemaType: 'Dentist',
      validityScore: 100,
      jsonLd: JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Dentist',
          name: 'Bright Smile Dental',
          description:
            'General and cosmetic dentistry clinic in Ramat Gan. Accepting new patients, most health funds, and private insurance.',
          url: 'https://brightsmile-dental.co.il',
          telephone: '+972-3-555-0123',
          email: 'hello@brightsmile-dental.co.il',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '14 HaArbaa St',
            addressLocality: 'Ramat Gan',
            addressRegion: 'Tel Aviv District',
            postalCode: '5252102',
            addressCountry: 'IL',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 32.0788,
            longitude: 34.8139,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
              opens: '09:00',
              closes: '19:00',
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Friday'],
              opens: '09:00',
              closes: '14:00',
            },
          ],
          acceptsInsurance: true,
          priceRange: '₪₪',
          areaServed: [
            { '@type': 'City', name: 'Ramat Gan' },
            { '@type': 'City', name: 'Tel Aviv' },
            { '@type': 'City', name: 'Givatayim' },
          ],
          hasMap: 'https://maps.app.goo.gl/brightsmile-ramat-gan',
          medicalSpecialty: 'Dentistry',
          availableService: [
            { '@type': 'MedicalTherapy', name: 'Teeth Whitening' },
            { '@type': 'MedicalTherapy', name: 'Dental Implants' },
            { '@type': 'MedicalTherapy', name: 'Root Canal Treatment' },
            { '@type': 'MedicalTherapy', name: 'Orthodontics' },
            { '@type': 'MedicalTherapy', name: 'Pediatric Dentistry' },
          ],
          image: 'https://brightsmile-dental.co.il/og-image.jpg',
          sameAs: [
            'https://www.facebook.com/brightsmile.dental.ramatgan',
            'https://www.instagram.com/brightsmile_dental',
            'https://www.yelp.com/biz/bright-smile-dental-ramat-gan',
          ],
        },
        null,
        2,
      ),
      missingFields: [],
      published: true,
      publishedAt: '2026-06-12T08:14:00.000Z',
      /** Where it was injected (for "what + where published" line). */
      publishTarget: 'brightsmile-dental.co.il — <head> structured data',
    },
  ] as (SchemaResult & { validityHistory?: number[]; publishTarget?: string })[],
} as const
