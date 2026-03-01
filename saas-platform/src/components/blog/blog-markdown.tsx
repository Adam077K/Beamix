'use client'
import ReactMarkdown from 'react-markdown'

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl text-[#141310] mt-10 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#141310] mt-10 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mt-8 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-stone-600 leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-stone-600">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-stone-600">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-stone-600 leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[#141310]">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-[#06B6D4] hover:underline font-medium"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#06B6D4] pl-4 my-6 italic text-stone-500">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return (
              <code className="block bg-[#141310] text-stone-300 rounded-xl p-6 text-sm overflow-x-auto my-6 font-mono">
                {children}
              </code>
            )
          }
          return (
            <code className="bg-stone-100 text-[#141310] px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          )
        },
        pre: ({ children }) => <pre className="not-prose">{children}</pre>,
        hr: () => <hr className="border-stone-200 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
