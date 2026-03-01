import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { PaymentFailedEmailProps } from '@/lib/email/types'

export function PaymentFailedEmail({
  name,
  amount,
  retryUrl,
  updatePaymentUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Payment failed — please update your payment method">
      <Section style={content}>
        <Section style={alertBanner}>
          <Text style={alertText}>Payment Failed</Text>
        </Section>

        <Text style={styles.heading}>We couldn&apos;t process your payment</Text>
        <Text style={styles.paragraph}>
          Hi {name}, your payment of <strong>{amount}</strong> didn&apos;t go through.
          This may be due to an expired card or insufficient funds.
        </Text>

        <Text style={styles.paragraph}>
          Please update your payment method to keep your account active.
        </Text>

        <Section style={ctaSection}>
          <Button href={retryUrl} style={styles.button}>
            Retry Payment
          </Button>
        </Section>

        <Section style={ctaSection}>
          <Button href={updatePaymentUrl} style={secondaryButton}>
            Update Payment Method
          </Button>
        </Section>

        <Text style={styles.muted}>
          If you continue to have issues, reply to this email and we&apos;ll help.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '12px 0' }

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

const secondaryButton = {
  ...styles.button,
  backgroundColor: 'transparent',
  color: '#06B6D4',
  border: '2px solid #06B6D4',
}
