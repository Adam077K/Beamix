import { Section, Text, Link } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { InvoiceReceiptEmailProps } from '@/lib/email/types'

export function InvoiceReceiptEmail({
  name,
  amount,
  currency,
  date,
  planName,
  invoiceUrl,
}: InvoiceReceiptEmailProps) {
  return (
    <EmailLayout preview={`Receipt: ${currency}${amount} for ${planName}`}>
      <Section style={content}>
        <Text style={styles.heading}>Payment Receipt</Text>
        <Text style={styles.paragraph}>
          Hi {name}, here&apos;s your receipt for Beamix.
        </Text>

        <Section style={receiptCard}>
          <Section style={receiptRow}>
            <Text style={receiptLabel}>Plan</Text>
            <Text style={receiptValue}>{planName}</Text>
          </Section>
          <Section style={receiptRow}>
            <Text style={receiptLabel}>Amount</Text>
            <Text style={receiptValue}>
              {currency}{amount}
            </Text>
          </Section>
          <Section style={receiptRow}>
            <Text style={receiptLabel}>Date</Text>
            <Text style={receiptValue}>{date}</Text>
          </Section>
        </Section>

        <Section style={ctaSection}>
          <Link href={invoiceUrl} style={invoiceLink}>
            Download Invoice (PDF)
          </Link>
        </Section>

        <Text style={styles.muted}>
          Questions about your bill? Reply to this email.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const receiptCard = {
  backgroundColor: '#FAFAF8',
  border: '1px solid #e5e5e0',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const receiptRow = {
  borderBottom: '1px solid #e5e5e0',
  padding: '12px 0',
}

const receiptLabel = {
  color: '#6b6b6b',
  fontSize: '13px',
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const receiptValue = {
  color: '#141310',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '4px 0 0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const invoiceLink = {
  color: '#06B6D4',
  fontSize: '15px',
  textDecoration: 'underline',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
