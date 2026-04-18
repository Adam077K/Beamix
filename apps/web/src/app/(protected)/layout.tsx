export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* App shell — sidebar + main — Wave 1 placeholder */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
