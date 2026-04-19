'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

type EngineStatus = 'pending' | 'running' | 'done'

interface EngineChip {
  id: string
  name: string
  icon: React.ReactNode
}

const SAMPLE_QUERIES = [
  'best CRM software for small businesses — what do you recommend?',
  'which accounting tools are trusted by freelancers in 2026?',
  'I need reliable HR software for a team of 20 — suggestions?',
  'what are the top-rated e-commerce platforms for European shops?',
  'recommend project management tools for agencies under $50/mo',
  'which legal services software do solo attorneys actually use?',
  'affordable SEO tools that work for local service businesses?',
  'what video conferencing platforms are best for remote-first startups?',
]

// Simple SVG engine logos as inline components — no broken image links
function ChatGPTIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GeminiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22.5c-.96-3.9-4.6-7.54-8.5-8.5 3.9-.96 7.54-4.6 8.5-8.5.96 3.9 4.6 7.54 8.5 8.5-3.9.96-7.54 4.6-8.5 8.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PerplexityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h7v2H5v14h14v-5h2v7H3V3zm11 0h7v7h-2V6.414l-8.293 8.293-1.414-1.414L21.586 5H14V3z"
        fill="currentColor"
      />
    </svg>
  )
}

const ENGINES: EngineChip[] = [
  { id: 'chatgpt', name: 'ChatGPT', icon: <ChatGPTIcon /> },
  { id: 'gemini', name: 'Gemini', icon: <GeminiIcon /> },
  { id: 'perplexity', name: 'Perplexity', icon: <PerplexityIcon /> },
]

// Engine status timing (ms)
// 0ms: all pending
// 500ms: chatgpt running
// 1400ms: chatgpt done, gemini running
// 2300ms: gemini done, perplexity running
// 3200ms: perplexity done
const ENGINE_TRANSITIONS: Array<{ at: number; states: EngineStatus[] }> = [
  { at: 0, states: ['pending', 'pending', 'pending'] },
  { at: 500, states: ['running', 'pending', 'pending'] },
  { at: 1400, states: ['done', 'running', 'pending'] },
  { at: 2300, states: ['done', 'done', 'running'] },
  { at: 3200, states: ['done', 'done', 'done'] },
]

function StatusDot({ status }: { status: EngineStatus }) {
  if (status === 'pending') {
    return <span className="size-2 rounded-full bg-white/20 block" aria-hidden="true" />
  }
  if (status === 'running') {
    return (
      <motion.span
        className="size-2 rounded-full bg-[#3370FF] block"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
    )
  }
  return (
    <motion.span
      className="size-2 rounded-full bg-emerald-400 block"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-hidden="true"
    />
  )
}

function QueryTicker() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setVisible(false)
      const fadeTimer = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % SAMPLE_QUERIES.length)
        setVisible(true)
      }, 250)
      return () => clearTimeout(fadeTimer)
    }, 1800)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex items-start gap-2.5 max-w-lg mx-auto text-left">
      <MessageSquare className="size-4 text-white/30 mt-0.5 shrink-0" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -4 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-[13px] text-white/40 leading-relaxed italic"
        >
          &ldquo;{SAMPLE_QUERIES[currentIndex]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

export function ScanningAnimation() {
  const [engineStates, setEngineStates] = React.useState<EngineStatus[]>(['pending', 'pending', 'pending'])

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    ENGINE_TRANSITIONS.forEach(({ at, states }) => {
      const t = setTimeout(() => {
        setEngineStates(states)
      }, at)
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-neutral-950 text-white min-h-[100dvh] flex flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-12 w-full max-w-lg">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-[36px] font-[500] text-white tracking-[-0.5px] leading-[1.1]">
            Scanning your AI visibility&hellip;
          </h2>
          <p className="mt-3 text-[15px] text-white/40 leading-relaxed">
            Asking ChatGPT, Gemini, and Perplexity about your business
          </p>
        </motion.div>

        {/* Engine chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.25 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {ENGINES.map((engine, i) => (
            <div
              key={engine.id}
              className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors duration-500 ${
                engineStates[i] === 'running'
                  ? 'border-[#3370FF]/40 bg-[#3370FF]/5'
                  : engineStates[i] === 'done'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-white/[0.08] bg-white/[0.04]'
              }`}
            >
              <div
                className={`transition-colors duration-500 ${
                  engineStates[i] === 'running'
                    ? 'text-[#3370FF]'
                    : engineStates[i] === 'done'
                    ? 'text-emerald-400'
                    : 'text-white/30'
                }`}
              >
                {engine.icon}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-500 ${
                  engineStates[i] === 'running'
                    ? 'text-white/80'
                    : engineStates[i] === 'done'
                    ? 'text-white/60'
                    : 'text-white/30'
                }`}
              >
                {engine.name}
              </span>
              <StatusDot status={engineStates[i]} />
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <div className="h-[2px] w-full rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full bg-[#3370FF] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '92%' }}
              transition={{ duration: 3.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>

        {/* Query ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full"
        >
          <p className="text-[11px] text-white/25 uppercase tracking-[0.1em] font-semibold mb-3 text-center">
            Live query sample
          </p>
          <QueryTicker />
        </motion.div>
      </div>
    </div>
  )
}
