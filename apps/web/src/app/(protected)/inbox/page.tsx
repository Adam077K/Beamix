import Link from 'next/link'
import { Inbox } from 'lucide-react'
import InboxClient from '@/components/inbox/InboxClient'
import { Button } from '@/components/ui/button'
import type { InboxItem } from '@/lib/types/shared'

const mockItems: InboxItem[] = [
  {
    id: '1',
    userId: 'u_mock',
    jobId: 'job_mock_1',
    actionLabel: 'Optimize your homepage',
    title: 'Homepage rewrite ready',
    status: 'awaiting_review',
    agentType: 'content_optimizer',
    targetUrl: 'https://example.com',
    createdAt: '2026-04-19T10:00:00Z',
    updatedAt: '2026-04-19T10:00:00Z',
    ymylFlagged: false,
    previewMarkdown:
      '# Homepage rewrite\n\nYour business helps SMBs win...',
    fullMarkdown:
      '# Homepage rewrite\n\nYour business helps SMBs win in AI search.\n\n## Why it matters\n\nChatGPT cites ...\n\n- Bullet one\n- Bullet two',
    evidence: {
      triggerSource: 'Weekly scan suggestion',
      targetQueries: ['best AI visibility tool', 'how to rank in ChatGPT'],
      impactEstimate: '+12 positions est.',
      citations: [],
    },
  },
  {
    id: '2',
    userId: 'u_mock',
    jobId: 'job_mock_2',
    actionLabel: 'Generate FAQ page',
    title: 'Pricing FAQ ready (8 Q&A)',
    status: 'awaiting_review',
    agentType: 'faq_builder',
    targetUrl: null,
    createdAt: '2026-04-19T08:00:00Z',
    updatedAt: '2026-04-19T08:00:00Z',
    ymylFlagged: false,
    previewMarkdown:
      '**Q: How much does Beamix cost?**\nA: Pricing starts at $79...',
    fullMarkdown:
      '## Pricing FAQ\n\n**Q: How much does Beamix cost?**\nA: Pricing starts at $79/mo for the Discover tier.\n\n**Q: Can I cancel anytime?**\nA: Yes, within 14 days get a full refund.',
    evidence: {
      triggerSource: 'Scan found 8 unanswered pricing queries',
      targetQueries: ['beamix cost', 'beamix pricing', 'is beamix cheap'],
      impactEstimate: '+8 query coverage',
      citations: [],
    },
  },
  {
    id: '3',
    userId: 'u_mock',
    jobId: 'job_mock_3',
    actionLabel: 'Check directory listings',
    title: '3 directories missing',
    status: 'draft',
    agentType: 'offsite_presence_builder',
    targetUrl: null,
    createdAt: '2026-04-18T14:00:00Z',
    updatedAt: '2026-04-18T14:00:00Z',
    ymylFlagged: false,
    previewMarkdown:
      'We found 3 high-value directories where your profile is incomplete or missing.',
    fullMarkdown:
      '## Missing directory listings\n\n1. **Yelp** — No profile. Submission package ready.\n2. **Capterra** — Unclaimed. Verify steps below.\n3. **G2** — No listing. Template provided.',
    evidence: {
      triggerSource: 'Scan crossref',
      targetQueries: ['best SaaS for X'],
      impactEstimate: 'Medium',
      citations: [],
    },
  },
]

export default function InboxPage() {
  if (mockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Inbox size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Your inbox is empty</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Agent outputs appear here for review. Accept a suggestion to run your first agent.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">View suggestions</Link>
        </Button>
      </div>
    )
  }

  return <InboxClient items={mockItems} />
}
