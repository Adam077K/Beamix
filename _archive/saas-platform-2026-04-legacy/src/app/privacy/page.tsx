import { ProductNav } from '@/components/shared/product-nav'
import { ProductFooter } from '@/components/shared/product-footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Beamix',
  description: 'Beamix privacy policy — how we collect, use, and protect your data.',
}

const sections = [
  {
    title: '1. Introduction',
    content: `Beamix ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information when you use our AI search visibility platform ("the Service").`,
  },
  {
    title: '2. Information We Collect',
    content: `We collect information you provide directly: email address, name, business name, website URL, industry, location, and service descriptions. We also collect usage data: scan results, agent interactions, content created, feature usage patterns. Technical data includes IP address, browser type, device information, and access timestamps. Payment data is processed by Paddle and we do not store credit card numbers.`,
  },
  {
    title: '3. How We Use Your Information',
    content: `We use your information to: (a) provide and improve the Service, including AI-powered scans and agent recommendations; (b) process transactions and manage subscriptions; (c) send service-related communications (scan results, agent completions, trial reminders); (d) send marketing emails (with your consent, which you can withdraw at any time); (e) analyze usage patterns to improve the platform; (f) prevent fraud and enforce our terms.`,
  },
  {
    title: '4. AI Processing',
    content: `To provide scan results and agent outputs, we send your business information (name, URL, industry, queries) to third-party AI providers including OpenAI, Anthropic, Google, and Perplexity. These providers process the data according to their respective privacy policies and API terms. We use API-level access which typically means your data is not used to train their models.`,
  },
  {
    title: '5. Data Storage and Security',
    content: `Your data is stored on Supabase infrastructure with row-level security policies ensuring data isolation between users. We use encryption in transit (TLS) and at rest. Integration credentials (e.g., WordPress passwords) are encrypted using AES-256-GCM. API keys are stored as salted SHA-256 hashes. We implement industry-standard security practices but cannot guarantee absolute security.`,
  },
  {
    title: '6. Data Sharing',
    content: `We do not sell your personal information. We share data with: (a) AI providers as needed to deliver scan and agent results; (b) Paddle for payment processing; (c) Resend for email delivery; (d) Vercel for hosting infrastructure. We may share data if required by law or to protect our rights.`,
  },
  {
    title: '7. Cookies and Tracking',
    content: `We use essential cookies for authentication and session management. We use analytics to understand usage patterns. We do not use third-party advertising cookies. You can control cookie settings through your browser.`,
  },
  {
    title: '8. Data Retention',
    content: `Active account data is retained for the duration of your subscription. Free scan results are retained for 30 days. After account deletion, we remove your data within 30 days, except where retention is required by law. Anonymized, aggregated data may be retained indefinitely for analytics.`,
  },
  {
    title: '9. Your Rights',
    content: `You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your account and data; (d) export your data; (e) withdraw consent for marketing communications; (f) object to processing. To exercise these rights, use the Settings page or contact privacy@beamix.app.`,
  },
  {
    title: '10. International Data Transfers',
    content: `Your data may be processed in locations outside your country of residence, including the United States (for AI provider APIs) and other regions where our infrastructure providers operate. We ensure appropriate safeguards are in place for such transfers.`,
  },
  {
    title: "11. Children's Privacy",
    content: `The Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover such data has been collected, we will delete it promptly.`,
  },
  {
    title: '12. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. The "Last updated" date will reflect the most recent revision.`,
  },
  {
    title: '13. Contact',
    content: `For privacy-related questions or requests, contact us at privacy@beamix.app.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProductNav />

      <main className="flex-1 px-6 pb-16 pt-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-sans font-medium text-3xl text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm mb-10">Last updated: March 2026</p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-sans font-semibold text-lg text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>

      <ProductFooter />
    </div>
  )
}
