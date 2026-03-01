import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { TrialDay12EmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function TrialDay12Email({
  name,
  daysLeft,
  featuresAtRisk,
}: TrialDay12EmailProps) {
  return (
    <EmailLayout preview={`${daysLeft} days left — don't lose your progress`}>
      <Section style={content}>
        <Section style={urgencyBanner}>
          <Text style={urgencyText}>{daysLeft} Days Left</Text>
        </Section>

        <Text style={styles.heading}>Your Trial Is Almost Over</Text>
        <Text style={styles.paragraph}>
          Hi {name}, your trial expires in {daysLeft} days.
          Here&apos;s what you&apos;ll lose access to:
        </Text>

        <Section style={riskCard}>
          {featuresAtRisk.map((feature, i) => (
            <Text key={i} style={riskItem}>
              &#10005; {feature}
            </Text>
          ))}
        </Section>

        <Text style={styles.paragraph}>
          Your data is safe — but you won&apos;t be able to run new scans, use agents,
          or track rankings without upgrading.
        </Text>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/pricing`} style={urgentButton}>
            Upgrade Now
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const urgencyBanner = {
  backgroundColor: '#FEF3C7',
  borderRadius: '10px',
  padding: '12px 20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const urgencyText = {
  color: '#92400E',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const riskCard = {
  backgroundColor: '#FEF2F2',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const riskItem = {
  color: '#991B1B',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 6px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const urgentButton = {
  ...styles.button,
  backgroundColor: '#F59E0B',
  fontSize: '18px',
  padding: '16px 40px',
}
