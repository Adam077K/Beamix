import { executeAgent } from '@/lib/agents/execute'

export async function POST(request: Request) {
  return executeAgent('faq-agent', request)
}
