export function ProductFooter() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Beamix. All rights reserved.</p>
      </div>
    </footer>
  )
}
