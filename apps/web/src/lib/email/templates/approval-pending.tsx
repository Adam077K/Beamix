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
export interface ApprovalPendingEmailProps {
  firstName: string
  /**
   * Pre-signed approval token. Used to construct the CTA URL.
   * TODO Wave 2: Generate this via a short-lived JWT (e.g. jose, 15-min TTL)
   *   signed with APPROVAL_SIGNING_SECRET. The link below assumes the token
   *   is already signed before being passed to this template.
   */
  signedToken: string
  /**
   * Human-readable description of what requires approval.
   * e.g. "a content draft for your homepage" or "an FAQ update for Google"
   */
  approvalDescription: string
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
  badge: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    padding: '8px 14px',
    display: 'inline-block',
    marginBottom: '20px',
  },
  badgeText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#3370FF',
    margin: '0',
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
export function ApprovalPendingEmail({
  firstName,
  signedToken,
  approvalDescription,
}: ApprovalPendingEmailProps): React.ReactElement {
  // TODO Wave 2: signing logic — currently accepts a pre-signed token.
  // When Wave 2 lands, this URL will be constructed server-side with a
  // freshly-signed JWT and the template will only receive the CTA URL,
  // not the raw token.
  const approvalUrl = `${APP_URL}/approvals?token=${encodeURIComponent(signedToken)}`

  const previewText = `Your input is needed — ${approvalDescription}`

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
            {/* Badge */}
            <Section style={styles.badge}>
              <Text style={styles.badgeText}>Action required</Text>
            </Section>

            <Heading as="h1" style={styles.heading}>
              {firstName}, your input is needed.
            </Heading>

            <Text style={styles.bodyText}>
              Your team has prepared {approvalDescription}. Before it goes live,
              we need your sign-off. Review it, leave notes, or approve it in
              one click.
            </Text>

            <Text style={styles.mutedText}>
              This approval link is valid for 24 hours. After that, you can
              still review drafts from your dashboard.
            </Text>

            <Button href={approvalUrl} style={styles.ctaButton}>
              Review &amp; approve
            </Button>

            <Hr style={styles.divider} />

            <Text style={styles.mutedText}>
              Not expecting this? You can safely ignore this email. Nothing will
              be published without your approval.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Beamix. All rights reserved.
              <br />
              You&apos;re receiving this because your account has pending approvals.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ApprovalPendingEmail
