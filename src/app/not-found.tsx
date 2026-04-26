import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <div className="text-center space-y-4 px-4">
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="text-2xl font-semibold">Page introuvable</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  )
}
