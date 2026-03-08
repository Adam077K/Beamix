import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { scanFree, scanManual, agentExecute } from '@/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scanFree, scanManual, agentExecute],
})
