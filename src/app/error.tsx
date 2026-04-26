'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 px-4">
        <p className="text-6xl font-bold text-destructive">500</p>
        <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  )
}
