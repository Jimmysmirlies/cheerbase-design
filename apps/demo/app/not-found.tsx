export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
    </main>
  )
}
