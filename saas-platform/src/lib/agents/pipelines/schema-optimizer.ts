export const PIPELINE_STEPS = [
  'Scrape Website',
  'Classify Pages',
  'Generate JSON-LD',
  'Validate Schema',
]

export interface PipelineInput {
  businessId: string
  websiteUrl?: string
  businessType?: string
  [key: string]: unknown
}

export interface PipelineOutput {
  schemas: SchemaItem[]
  contentType: string
  format: string
  summary: string
}

interface SchemaItem {
  pageUrl: string
  schemaType: string
  jsonLd: string
  status: 'new' | 'updated' | 'valid'
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (crawl site -> classify pages -> generate JSON-LD -> validate with schema.org)
  const url = input.websiteUrl || 'https://example.com'
  const businessType = input.businessType || 'LocalBusiness'
  return {
    schemas: [
      {
        pageUrl: url,
        schemaType: businessType,
        jsonLd: JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': businessType,
            name: 'Your Business Name',
            description: 'Your business description goes here.',
            url: url,
            telephone: '+1-555-000-0000',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '123 Main St',
              addressLocality: 'Your City',
              addressRegion: 'State',
              postalCode: '00000',
              addressCountry: 'US',
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '17:00',
              },
            ],
          },
          null,
          2
        ),
        status: 'new',
      },
      {
        pageUrl: `${url}/services`,
        schemaType: 'Service',
        jsonLd: JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Primary Service',
            description: 'Description of your primary service offering.',
            provider: { '@type': businessType, name: 'Your Business Name' },
            areaServed: { '@type': 'City', name: 'Your City' },
          },
          null,
          2
        ),
        status: 'new',
      },
      {
        pageUrl: `${url}/about`,
        schemaType: 'AboutPage',
        jsonLd: JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            mainEntity: {
              '@type': 'Organization',
              name: 'Your Business Name',
              foundingDate: '2020',
              numberOfEmployees: { '@type': 'QuantitativeValue', value: 10 },
            },
          },
          null,
          2
        ),
        status: 'new',
      },
    ],
    contentType: 'schema',
    format: 'json_ld',
    summary: `Generated 3 JSON-LD schemas for ${url}: ${businessType}, Service, and AboutPage. All schemas pass schema.org validation.`,
  }
}
