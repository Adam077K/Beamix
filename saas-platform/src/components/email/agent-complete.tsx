import { Section, Text, Button } from '@react-email/components'
import { EmailLayout, styles } from './layout'
import type { AgentCompleteEmailProps } from '@/lib/email/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io'

export function AgentCompleteEmail({
  agentName,
  outputPreview,
  executionId,
}: AgentCompleteEmailProps) {
  return (
    <EmailLayout preview={`Your ${agentName} output is ready`}>
      <Section style={content}>
        <Text style={styles.heading}>Your {agentName} Output Is Ready</Text>
        <Text style={styles.paragraph}>
          The {agentName} agent has finished working. Here&apos;s a preview of what was generated:
        </Text>

        <Section style={previewCard}>
          <Text style={previewText}>
            {outputPreview.slice(0, 150)}
            {outputPreview.length > 150 ? '...' : ''}
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Button
            href={`${BASE_URL}/dashboard/agents/${executionId}`}
            style={styles.button}
          >
            View &amp; Edit
          </Button>
        </Section>

        <Text style={styles.muted}>
          You can find all agent outputs in your Content Library.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content = { padding: '32px 40px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }

const previewCard = {
  backgroundColor: '#FAFAF8',
  border: '1px solid #e5e5e0',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const previewText = {
  ...styles.paragraph,
  color: '#4a4a4a',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  margin: '0',
}
