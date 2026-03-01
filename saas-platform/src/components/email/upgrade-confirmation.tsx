import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { UpgradeConfirmationEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function UpgradeConfirmationEmail({
  name,
  planName,
  monthlyCredits,
  maxQueries,
  features,
}: UpgradeConfirmationEmailProps) {
  return (
    <EmailLayout preview={`You're now on the ${planName} plan!`}>
      <Section style={content}>
        <Text style={styles.heading}>You&apos;re on {planName}!</Text>
        <Text style={styles.paragraph}>
          Hi {name}, welcome to the <strong>{planName}</strong> plan.
          Here&apos;s what&apos;s now available to you.
        </Text>

        <Section style={limitsCard}>
          <Section style={limitRow}>
            <Text style={limitLabel}>Monthly Credits</Text>
            <Text style={limitValue}>{monthlyCredits}</Text>
          </Section>
          <Section style={limitRow}>
            <Text style={limitLabel}>Tracked Queries</Text>
            <Text style={limitValue}>{maxQueries}</Text>
          </Section>
        </Section>

        {features.length > 0 && (
          <Section style={featureCard}>
            <Text style={featureHeading}>Your Features</Text>
            {features.map((feature, i) => (
              <Text key={i} style={featureItem}>
                &#10003; {feature}
              </Text>
            ))}
          </Section>
        )}

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/dashboard`} style={styles.button}>
            Go to Dashboard
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const limitsCard = {
  backgroundColor: '#F0FDFA',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const limitRow = {
  margin: '0 0 12px',
}

const limitLabel = {
  color: '#6b6b6b',
  fontSize: '13px',
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const limitValue = {
  color: '#141310',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '2px 0 0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const featureCard = {
  ...styles.card,
}

const featureHeading = {
  color: '#141310',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const featureItem = {
  color: '#0891B2',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 6px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
