import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { CancellationEmailProps } from '@/lib/email/types'

export function CancellationEmail({
  name,
  planName,
  activeUntil,
  reactivateUrl,
}: CancellationEmailProps) {
  return (
    <EmailLayout preview="We're sorry to see you go">
      <Section style={content}>
        <Text style={styles.heading}>We&apos;re Sorry to See You Go</Text>
        <Text style={styles.paragraph}>
          Hi {name}, your <strong>{planName}</strong> plan has been cancelled.
          You&apos;ll continue to have access until <strong>{activeUntil}</strong>.
        </Text>

        <Section style={infoCard}>
          <Text style={infoHeading}>What happens to your data?</Text>
          <Text style={styles.listItem}>
            &#8226; Scan history and results are retained for 90 days
          </Text>
          <Text style={styles.listItem}>
            &#8226; Generated content is available for download
          </Text>
          <Text style={styles.listItem}>
            &#8226; You can reactivate anytime to restore full access
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Changed your mind? You can reactivate instantly.
        </Text>

        <Section style={ctaSection}>
          <Button href={reactivateUrl} style={styles.button}>
            Reactivate My Plan
          </Button>
        </Section>

        <Text style={styles.muted}>
          We&apos;d love to know why you left. Reply with any feedback — it helps us improve.
        </Text>
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
