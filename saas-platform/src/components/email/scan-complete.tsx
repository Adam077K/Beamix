import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { ScanCompleteEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function ScanCompleteEmail({
  businessName,
  score,
  scoreColor,
  quickWins,
  scanId,
}: ScanCompleteEmailProps) {
  return (
    <EmailLayout preview={`${businessName} scored ${score}/100 in AI visibility`}>
      <Section style={content}>
        <Text style={styles.heading}>Your Scan Results Are In</Text>
        <Text style={styles.paragraph}>
          We scanned how AI search engines talk about <strong>{businessName}</strong>.
          Here&apos;s what we found.
        </Text>

        <Section style={scoreCard}>
          <Text style={scoreLabel}>AI Visibility Score</Text>
          <Text style={{ ...scoreValue, color: scoreColor }}>{score}</Text>
          <Text style={scoreSubtext}>out of 100</Text>
        </Section>

        {quickWins.length > 0 && (
          <>
            <Text style={{ ...styles.paragraph, fontWeight: '600', margin: '24px 0 12px' }}>
              Top Quick Wins
            </Text>
            {quickWins.slice(0, 3).map((win, i) => (
              <Text key={i} style={styles.listItem}>
                {i + 1}. {win}
              </Text>
            ))}
          </>
        )}

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/scan/${scanId}`} style={styles.button}>
            See Full Results
          </Button>
        </Section>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/signup?scan_id=${scanId}`} style={secondaryButton}>
            Create Account to Track Progress
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '16px 0' }

const scoreCard = {
  backgroundColor: '#F0FDFA',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const scoreLabel = {
  ...styles.muted,
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontSize: '12px',
}

const scoreValue = {
  fontSize: '48px',
  fontWeight: '800' as const,
  margin: '0',
  lineHeight: '1',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const scoreSubtext = {
  ...styles.muted,
  margin: '4px 0 0',
}

const secondaryButton = {
  ...styles.button,
  backgroundColor: 'transparent',
  color: '#06B6D4',
  border: '2px solid #06B6D4',
}
