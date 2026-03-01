import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Preview,
} from '@react-email/components'
import type { ReactNode } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>BEAMIX</Text>
          </Section>
          {children}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${BASE_URL}/dashboard/settings`} style={footerLink}>
                Manage preferences
              </Link>
              {' | '}
              <Link href={`${BASE_URL}/unsubscribe`} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerCompany}>
              Beamix - AI Search Visibility Platform
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Shared styles used across templates
export const styles = {
  heading: {
    color: '#141310',
    fontSize: '24px',
    fontWeight: '700' as const,
    lineHeight: '1.3',
    margin: '0 0 16px',
    fontFamily: 'Georgia, serif',
  },
  paragraph: {
    color: '#3c3c3c',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  button: {
    backgroundColor: '#06B6D4',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block' as const,
    fontSize: '16px',
    fontWeight: '600' as const,
    lineHeight: '1',
    padding: '14px 32px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e0',
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
  },
  badge: {
    display: 'inline-block' as const,
    backgroundColor: '#E0F7FA',
    color: '#0891B2',
    fontSize: '13px',
    fontWeight: '600' as const,
    padding: '4px 10px',
    borderRadius: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  listItem: {
    color: '#3c3c3c',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0 0 8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  muted: {
    color: '#6b6b6b',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  section: {
    padding: '24px 0',
  },
} as const

const body = {
  backgroundColor: '#FAFAF8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e0',
  borderRadius: '16px',
  margin: '40px auto',
  maxWidth: '600px',
  padding: '0',
}

const header = {
  backgroundColor: '#141310',
  borderRadius: '16px 16px 0 0',
  padding: '24px 40px',
}

const logo = {
  color: '#06B6D4',
  fontSize: '20px',
  fontWeight: '800' as const,
  letterSpacing: '3px',
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const divider = {
  borderColor: '#e5e5e0',
  margin: '0',
}

const footer = {
  padding: '20px 40px 24px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  textAlign: 'center' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
}

const footerCompany = {
  color: '#c4c4c4',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
