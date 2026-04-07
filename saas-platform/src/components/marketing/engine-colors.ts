// Engine brand colors — from the "Traffic by AI Engine" donut chart
// Use these across all marketing components for consistency

export const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#10B981',
  Claude: '#D4A574',
  Gemini: '#4285F4',
  'Google AI': '#EA4335',
  Perplexity: '#8B5CF6',
  Grok: '#6B7280',
}

// Ordered palette for agent cursors (5 agents mapped to 5 engines)
export const AGENT_PALETTE = [
  { engine: 'ChatGPT', color: '#10B981' },
  { engine: 'Claude', color: '#D4A574' },
  { engine: 'Gemini', color: '#4285F4' },
  { engine: 'Perplexity', color: '#8B5CF6' },
  { engine: 'Google AI', color: '#EA4335' },
] as const
