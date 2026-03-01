import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { TrialExpiredEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function TrialExpiredEmail({ name, planName }: TrialExpiredEmailProps) {
  return (
    <EmailLayout preview="Your trial has ended — your data is safe">
      <Section style={content}>
        <Text style={styles.heading}>Your Trial Has Ended</Text>
        <Text style={styles.paragraph}>
          Hi {name}, your {planName} trial has expired. But don&apos;t worry —
          all your data, scan history, and generated content are safe.
        </Text>

        <Section style={infoCard}>
          <Text style={infoHeading}>What happens now?</Text>
          <Text style={styles.listItem}>
            &#8226; Your existing data is preserved
          </Text>
          <Text style={styles.listItem}>
            &#8226; You can view past results in read-only mode
          </Text>
          <Text style={styles.listItem}>
            &#8226; New scans and agents require an active plan
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Pick a plan to continue improving your AI search visibility.
        </Text>

        <Section style={ctaSection}>
          <Button href={`${BASE_URL}/pricing`} style={styles.button}>
            Choose a Plan
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const infoCard = {
  backgroundColor: '#FAFAF8',
  border: '1px solid #e5e5e0',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const infoHeading = {
  color: '#141310',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
