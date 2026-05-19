export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">Page not found</p>
        <a href="/home" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to dashboard
        </a>
      </div>
    </main>
  )
}
