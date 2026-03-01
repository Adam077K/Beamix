import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { CompetitorMovedEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function CompetitorMovedEmail({
  name,
  competitorName,
  engine,
  query,
  competitorPosition,
  yourPosition,
}: CompetitorMovedEmailProps) {
  const overtook = competitorPosition < yourPosition

  return (
    <EmailLayout preview={`${competitorName} ${overtook ? 'overtook you' : 'moved'} on ${engine}`}>
      <Section style={content}>
        <Section style={warningBanner}>
          <Text style={warningText}>Competitor Alert</Text>
        </Section>

        <Text style={styles.heading}>
          {overtook
            ? `${competitorName} Overtook You`
            : `${competitorName} Is Moving Up`}
        </Text>
        <Text style={styles.paragraph}>
          Hi {name}, your competitor <strong>{competitorName}</strong>{' '}
          {overtook ? 'has moved ahead of you' : 'is gaining ground'} on{' '}
          <strong>{engine}</strong>.
        </Text>

        <Section style={comparisonCard}>
          <Text style={queryText}>&quot;{query}&quot;</Text>
          <Section style={comparisonRow}>
            <Section style={competitorCol}>
              <Text style={colLabel}>{competitorName}</Text>
              <Text style={{ ...colValue, color: overtook ? '#059669' : '#F59E0B' }}>
                #{competitorPosition}
              </Text>
            </Section>
            <Text style={vs}>vs</Text>
            <Section style={yourCol}>
              <Text style={colLabel}>You</Text>
              <Text style={{ ...colValue, color: overtook ? '#DC2626' : '#059669' }}>
                #{yourPosition}
              </Text>
            </Section>
          </Section>
        </Section>

        <Text style={styles.paragraph}>
          Use Beamix agents to create optimized content and improve your rankings.
        </Text>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/dashboard/agents`} style={styles.button}>
            Launch an Agent
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const warningBanner = {
  backgroundColor: '#FEF3C7',
  borderRadius: '10px',
  padding: '12px 20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const warningText = {
  color: '#92400E',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const comparisonCard = {
  backgroundColor: '#FAFAF8',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const queryText = {
  color: '#141310',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 16px',
  fontFamily: 'Georgia, serif',
}

const comparisonRow = {
  textAlign: 'center' as const,
}

const competitorCol = {
  display: 'inline-block' as const,
  width: '35%',
  textAlign: 'center' as const,
}

const yourCol = {
  display: 'inline-block' as const,
  width: '35%',
  textAlign: 'center' as const,
}

const vs = {
  display: 'inline-block' as const,
  width: '20%',
  textAlign: 'center' as const,
  fontSize: '14px',
  color: '#9ca3af',
  fontWeight: '600' as const,
  verticalAlign: 'middle' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const colLabel = {
  ...styles.muted,
  margin: '0 0 4px',
  fontSize: '12px',
}

const colValue = {
  fontSize: '28px',
  fontWeight: '800' as const,
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
