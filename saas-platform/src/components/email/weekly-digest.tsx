import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { WeeklyDigestEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function WeeklyDigestEmail({
  name,
  rankChange,
  newRecommendations,
  contentUpdates,
  topQuery,
  topQueryScore,
}: WeeklyDigestEmailProps) {
  const rankDirection = rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : 'unchanged'
  const rankEmoji = rankChange > 0 ? '+' : ''

  return (
    <EmailLayout preview={`Weekly digest: rank ${rankEmoji}${rankChange}, ${newRecommendations} new tips`}>
      <Section style={content}>
        <Text style={styles.heading}>Your Weekly Digest</Text>
        <Text style={styles.paragraph}>
          Hi {name}, here&apos;s what happened with your AI visibility this week.
        </Text>

        <Section style={statsRow}>
          <Section style={statCard}>
            <Text style={{
              ...statValue,
              color: rankDirection === 'up' ? '#059669' : rankDirection === 'down' ? '#DC2626' : '#6b6b6b',
            }}>
              {rankEmoji}{rankChange}
            </Text>
            <Text style={statLabel}>Rank Change</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statValue}>{newRecommendations}</Text>
            <Text style={statLabel}>New Tips</Text>
          </Section>
          <Section style={statCard}>
            <Text style={statValue}>{contentUpdates}</Text>
            <Text style={statLabel}>Content Updates</Text>
          </Section>
        </Section>

        {topQuery && (
          <Section style={topQueryCard}>
            <Text style={topQueryLabel}>Top Performing Query</Text>
            <Text style={topQueryText}>&quot;{topQuery}&quot;</Text>
            <Text style={topQueryScore_}>Score: {topQueryScore}/100</Text>
          </Section>
        )}

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/dashboard`} style={styles.button}>
            View Full Dashboard
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

const topQueryCard = {
  backgroundColor: '#F0FDFA',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const topQueryLabel = {
  ...styles.muted,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontSize: '11px',
}

const topQueryText = {
  color: '#141310',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
  fontFamily: 'Georgia, serif',
}

const topQueryScore_ = {
  color: '#06B6D4',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
