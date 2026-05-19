'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Critical error</h1>
            <p className="mt-2 text-gray-600">{error.message}</p>
            <button onClick={reset} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white">
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
