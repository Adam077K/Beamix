import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { WelcomeEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function WelcomeEmail({ name, scanId, scanScore }: WelcomeEmailProps) {
  const ctaUrl = scanId
    ? `${BASE_URL}/scan/${scanId}`
    : `${BASE_URL}/dashboard`

  return (
    <EmailLayout preview={`Welcome to Beamix, ${name}! Your AI visibility journey starts now.`}>
      <Section style={content}>
        <Text style={styles.heading}>Welcome to Beamix!</Text>
        <Text style={styles.paragraph}>
          Hi {name}, welcome aboard. Beamix helps you understand how AI search
          engines see your business — and what to do about it.
        </Text>

        {scanId && scanScore !== undefined && (
          <Section style={scoreCard}>
            <Text style={scoreLabel}>Your Visibility Score</Text>
            <Text style={scoreValue}>{scanScore}</Text>
            <Text style={scoreSubtext}>out of 100</Text>
          </Section>
        )}

        <Text style={styles.paragraph}>
          {scanId
            ? 'Your scan results are ready. See exactly how AI engines mention your business.'
            : 'Start by running your first scan to see how AI search engines talk about your business.'}
        </Text>

        <Section style={ctaSection}>
          <Button href={ctaUrl} style={styles.button}>
            {scanId ? 'View Your Scan' : 'Run Your First Scan'}
          </Button>
        </Section>

        <Text style={styles.muted}>
          Have questions? Just reply to this email — we read every message.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

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
  color: '#06B6D4',
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
