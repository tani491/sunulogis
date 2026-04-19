import { Building2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">
                Sunu<span className="text-primary">Logis</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme de réservation d&apos;hébergements au Sénégal. Auberges, hôtels, appartements meublés et lodges à travers les 14 régions.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Liens utiles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Accueil</li>
              <li>Établissements</li>
              <li>Blog</li>
              <li>Devenir propriétaire</li>
              <li>Conditions d&apos;utilisation</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Dakar, Sénégal</li>
              <li>contact@sunulogis.sn</li>
              <li>+221 77 000 00 00</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          Fait avec <Heart className="h-3 w-3 text-red-500 fill-red-500" /> au Sénégal &copy; {new Date().getFullYear()} SunuLogis
        </div>
      </div>
    </footer>
  );
}
