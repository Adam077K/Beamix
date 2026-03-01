import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { RankingDropEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function RankingDropEmail({
  name,
  businessName,
  engine,
  query,
  previousPosition,
  currentPosition,
  suggestion,
}: RankingDropEmailProps) {
  return (
    <EmailLayout preview={`Ranking dropped on ${engine} for "${query}"`}>
      <Section style={content}>
        <Section style={alertBanner}>
          <Text style={alertText}>Ranking Alert</Text>
        </Section>

        <Text style={styles.heading}>Your Ranking Dropped</Text>
        <Text style={styles.paragraph}>
          Hi {name}, <strong>{businessName}</strong>&apos;s position changed on{' '}
          <strong>{engine}</strong>.
        </Text>

        <Section style={changeCard}>
          <Text style={queryText}>&quot;{query}&quot;</Text>
          <Section style={positionRow}>
            <Section style={positionBefore}>
              <Text style={positionLabel}>Before</Text>
              <Text style={positionValue}>#{previousPosition}</Text>
            </Section>
            <Text style={arrow}>&#8594;</Text>
            <Section style={positionAfter}>
              <Text style={positionLabel}>Now</Text>
              <Text style={{ ...positionValue, color: '#DC2626' }}>#{currentPosition}</Text>
            </Section>
          </Section>
        </Section>

        <Section style={suggestionCard}>
          <Text style={suggestionHeading}>Suggested Fix</Text>
          <Text style={styles.paragraph}>{suggestion}</Text>
        </Section>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/dashboard/rankings`} style={styles.button}>
            View Rankings
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const alertBanner = {
  backgroundColor: '#FEF2F2',
  borderRadius: '10px',
  padding: '12px 20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const alertText = {
  color: '#991B1B',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const changeCard = {
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

const positionRow = {
  textAlign: 'center' as const,
}

const positionBefore = {
  display: 'inline-block' as const,
  width: '35%',
  textAlign: 'center' as const,
}

const positionAfter = {
  display: 'inline-block' as const,
  width: '35%',
  textAlign: 'center' as const,
}

const arrow = {
  display: 'inline-block' as const,
  width: '20%',
  textAlign: 'center' as const,
  fontSize: '24px',
  color: '#9ca3af',
  verticalAlign: 'middle' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const positionLabel = {
  ...styles.muted,
  margin: '0 0 4px',
  fontSize: '12px',
}

const positionValue = {
  color: '#059669',
  fontSize: '28px',
  fontWeight: '800' as const,
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const suggestionCard = {
  backgroundColor: '#F0FDFA',
  border: '1px solid #CFFAFE',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const suggestionHeading = {
  color: '#0891B2',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
