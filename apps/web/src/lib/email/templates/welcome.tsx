import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface WelcomeEmailProps {
  firstName: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const APP_URL = 'https://app.beamixai.com'

const styles = {
  main: {
    backgroundColor: '#F7F7F7',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    maxWidth: '580px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  logoSection: {
    paddingBottom: '24px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: '-0.5px',
    margin: '0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '40px 40px 32px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: '1.3',
    margin: '0 0 16px',
    letterSpacing: '-0.3px',
  },
  bodyText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  mutedText: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  ctaButton: {
    backgroundColor: '#3370FF',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '8px',
  },
  divider: {
    borderColor: '#E5E7EB',
    margin: '28px 0',
  },
  footer: {
    textAlign: 'center' as const,
    paddingTop: '24px',
  },
  footerText: {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.5',
    margin: '0',
  },
} as const

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------
export function WelcomeEmail({ firstName }: WelcomeEmailProps): React.ReactElement {
  const previewText = `Welcome to Beamix, ${firstName}. Your team is preparing your brand brief.`

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Logo */}
          <Section style={styles.logoSection}>
            <Text style={styles.logoText}>Beamix</Text>
          </Section>

          {/* Card */}
          <Section style={styles.card}>
            <Heading as="h1" style={styles.heading}>
              Welcome to Beamix, {firstName}.
            </Heading>

            <Text style={styles.bodyText}>
              Your team is preparing your brand brief. In the next few minutes,
              we'll have a full picture of how your business appears across AI
              search — and exactly what needs to change.
            </Text>

            <Text style={styles.bodyText}>
              Head to your dashboard to see the results as they come in, review
              your visibility score, and start turning insights into action.
            </Text>

            <Button href={`${APP_URL}/home`} style={styles.ctaButton}>
              Go to your dashboard
            </Button>

            <Hr style={styles.divider} />

            <Text style={styles.mutedText}>
              Questions? Reply to this email — a real person will get back to you.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Beamix. All rights reserved.
              <br />
              You're receiving this because you signed up for Beamix.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
