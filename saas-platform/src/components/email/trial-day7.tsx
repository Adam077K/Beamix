import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { TrialDay7EmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function TrialDay7Email({
  name,
  currentScore,
  contentGenerated,
  daysLeft,
}: TrialDay7EmailProps) {
  return (
    <EmailLayout preview={`${daysLeft} days in — here's your progress`}>
      <Section style={content}>
        <Text style={styles.heading}>One Week In — Here&apos;s Your Progress</Text>
        <Text style={styles.paragraph}>
          Hi {name}, you&apos;re halfway through your trial. Here&apos;s what you&apos;ve
          accomplished so far.
        </Text>

        <Section style={statsRow}>
          <Section style={statCard}>
            <Text style={statValue}>{currentScore}</Text>
            <Text style={statLabel}>Current Score</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statValue}>{contentGenerated}</Text>
            <Text style={statLabel}>Content Generated</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statValue}>{daysLeft}</Text>
            <Text style={statLabel}>Days Left</Text>
          </Section>
        </Section>

        <Text style={styles.paragraph}>
          Don&apos;t lose your progress. Upgrade now to keep everything you&apos;ve built.
        </Text>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/pricing`} style={styles.button}>
            Upgrade Now
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const statsRow = {
  margin: '24px 0',
}

const statCard = {
  display: 'inline-block' as const,
  width: '30%',
  textAlign: 'center' as const,
  padding: '16px 8px',
  backgroundColor: '#FAFAF8',
  borderRadius: '10px',
  margin: '0 4px',
}

const statValue = {
  color: '#06B6D4',
  fontSize: '28px',
  fontWeight: '800' as const,
  margin: '0',
  lineHeight: '1.2',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const statLabel = {
  ...styles.muted,
  margin: '4px 0 0',
  fontSize: '12px',
}
