import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { MagicLinkEmailProps } from '@/lib/email/types'

export function MagicLinkEmail({ magicLink }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your Beamix login link">
      <Section style={content}>
        <Text style={styles.heading}>Your Login Link</Text>
        <Text style={styles.paragraph}>
          Click the button below to sign in to your Beamix account.
          This link expires in 10 minutes.
        </Text>

        <Section style={ctaSection}>
          <Button href={magicLink} style={styles.button}>
            Sign In to Beamix
          </Button>
        </Section>

        <Text style={styles.muted}>
          If you didn&apos;t request this link, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
