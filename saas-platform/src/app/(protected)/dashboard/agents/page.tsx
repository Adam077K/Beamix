import { redirect } from 'next/navigation'

// Agents hub merged into Action Center. Individual agent chat stays at /agents/[agent_id]
export default function AgentsPage() {
  redirect('/dashboard/action-center')
}
