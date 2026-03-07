import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { TrialStartEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function TrialStartEmail({
  name,
  planName,
  trialEndDate,
  unlockedFeatures,
}: TrialStartEmailProps) {
  return (
    <EmailLayout preview={`Your 7-day ${planName} trial starts now`}>
      <Section style={content}>
        <Text style={styles.heading}>Your 14-Day Trial Starts Now</Text>
        <Text style={styles.paragraph}>
          Hi {name}, you now have full access to the <strong>{planName}</strong> plan
          until {trialEndDate}. No credit card required.
        </Text>

        <Section style={featureCard}>
          <Text style={featureHeading}>What&apos;s Unlocked</Text>
          {unlockedFeatures.map((feature, i) => (
            <Text key={i} style={featureItem}>
              &#10003; {feature}
            </Text>
          ))}
        </Section>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/dashboard`} style={styles.button}>
            Start Exploring
          </Button>
        </Section>

        <Text style={styles.muted}>
          Your trial ends on {trialEndDate}. We&apos;ll send a reminder before it expires.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const featureCard = {
  backgroundColor: '#F0FDFA',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
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
