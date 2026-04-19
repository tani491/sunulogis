# AubergeConnect

**Plateforme SaaS de gestion de réservations d'auberges pour le marché sénégalais**

AubergeConnect est une application web qui permet aux propriétaires d'auberges de gérer leurs établissements, chambres et réservations, tout en offrant aux visiteurs une interface publique pour parcourir les auberges, filtrer par ville et prix, et réserver via WhatsApp.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation locale](#installation-locale)
- [Identifiants de démonstration](#identifiants-de-démonstration)
- [Déroulement de l'application](#déroulement-de-lapplication)
- [Schéma de la base de données](#schéma-de-la-base-de-données)
- [API Routes](#api-routes)
- [Déploiement en production](#déploiement-en-production)
- [Migration vers Supabase (Production)](#migration-vers-supabase-production)
- [Scripts disponibles](#scripts-disponibles)

---

## Fonctionnalités

### Interface publique (visiteurs)

| Fonctionnalité | Description |
|---|---|
| Page d'accueil | Liste de toutes les auberges avec galerie d'images |
| Filtres | Filtrage par ville et par fourchette de prix |
| Fiche auberge | Détail complet : images, description, adresse, chambres disponibles |
| Réservation | Formulaire de réservation avec calcul automatique du coût total |
| Confirmation WhatsApp | Lien pré-rempli `wa.me` pour confirmer la réservation par message |
| Lien site web | Accès direct au site web de l'auberge si renseigné |

### Dashboard propriétaire (authentifié)

| Fonctionnalité | Description |
|---|---|
| Inscription / Connexion | Authentification par email et mot de passe |
| Vue d'ensemble | Statistiques : nombre d'auberges, chambres, réservations en attente/confirmées |
| Gestion des auberges | CRUD complet avec upload d'images par drag & drop |
| Gestion des chambres | CRUD complet avec prix, capacité, disponibilité |
| Gestion des réservations | Liste avec filtres, confirmation / annulation, badges de statut |

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 16.x | Framework React avec App Router |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Framework CSS utilitaire |
| Shadcn/UI | — | Bibliothèque de composants (Radix UI) |
| Lucide React | 0.525+ | Icônes SVG |
| Prisma | 6.x | ORM (SQLite en local, PostgreSQL en production) |
| Zustand | 5.x | Gestion d'état côté client (routing SPA, session) |
| Sonner | 2.x | Notifications toast |
| date-fns | 4.x | Manipulation et formatage des dates |
| sharp | 0.34+ | Traitement d'images (disponible, non utilisé actuellement) |

---

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # POST - Connexion
│   │   │   ├── logout/route.ts         # POST - Déconnexion
│   │   │   ├── register/route.ts       # POST - Inscription
│   │   │   └── session/route.ts        # GET  - Vérifier la session
│   │   ├── bookings/
│   │   │   ├── route.ts                # GET, POST - Liste et création
│   │   │   └── [id]/route.ts           # GET, PUT, DELETE - CRUD
│   │   ├── hostels/
│   │   │   ├── route.ts                # GET, POST - Liste et création
│   │   │   └── [id]/route.ts           # GET, PUT, DELETE - CRUD
│   │   ├── rooms/
│   │   │   ├── route.ts                # GET, POST - Liste et création
│   │   │   └── [id]/route.ts           # GET, PUT, DELETE - CRUD
│   │   ├── seed/route.ts               # GET  - Données de démonstration
│   │   ├── upload/route.ts             # POST - Upload d'images
│   │   └── route.ts                    # Health check
│   ├── layout.tsx                      # Layout racine
│   └── page.tsx                        # Point d'entrée (SPA)
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx               # Formulaire de connexion
│   │   └── RegisterPage.tsx            # Formulaire d'inscription
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx         # Sidebar + routing du dashboard
│   │   ├── DashboardOverview.tsx       # Statistiques et vue d'ensemble
│   │   ├── ManageHostel.tsx            # CRUD auberges avec upload images
│   │   ├── ManageRooms.tsx             # CRUD chambres
│   │   └── ManageBookings.tsx          # Gestion des réservations
│   ├── public/
│   │   ├── HomePage.tsx                # Page d'accueil publique
│   │   ├── HostelDetailPage.tsx        # Détail d'une auberge
│   │   └── BookingForm.tsx             # Formulaire de réservation + WhatsApp
│   ├── shared/
│   │   ├── DragDropImageUpload.tsx     # Composant drag & drop d'images
│   │   ├── Navbar.tsx                  # Barre de navigation
│   │   └── Footer.tsx                  # Pied de page
│   └── ui/                             # Composants Shadcn/UI
├── hooks/
│   ├── use-mobile.ts                   # Détection mobile
│   └── use-toast.ts                    # Hook toast
├── lib/
│   ├── auth.ts                         # Hash SHA-256 + session cookie
│   ├── db.ts                           # Singleton PrismaClient
│   └── utils.ts                        # Utilitaire cn()
├── store/
│   └── app-store.ts                    # Store Zustand (navigation SPA, session)
prisma/
└── schema.prisma                       # Schéma de la base de données
public/
├── uploads/hostels/                    # Images uploadées (créé automatiquement)
├── logo.svg
└── robots.txt
```

---

## Installation locale

### Prérequis

- **Node.js** 18+ ou **Bun** (recommandé)
- **npm** ou **bun** comme gestionnaire de paquets

### Étapes d'installation

1. **Cloner le dépôt et installer les dépendances**

```bash
git clone <url-du-repo>
cd aubergeconnect
npm install
# ou
bun install
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL=file:./db/custom.db
```

> Pour une base SQLite locale, le chemin est relatif au dossier `prisma/`. Le fichier `custom.db` sera créé automatiquement.

3. **Initialiser la base de données**

```bash
npx prisma generate
npx prisma db push
```

4. **Peupler la base avec les données de démonstration**

Lancer le serveur puis visiter l'URL de seed :

```bash
npm run dev
# Dans un navigateur, aller sur :
# http://localhost:3000/api/seed
```

Cela crée automatiquement :
- Un propriétaire de démo
- 3 auberges (Dakar, Saint-Louis, Saly)
- 11 chambres
- 3 réservations d'exemple

5. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**

---

## Identifiants de démonstration

| Champ | Valeur |
|---|---|
| Email | `demo@aubergeconnect.sn` |
| Mot de passe | `password` |

> Le mot de passe est hashé en SHA-256 côté serveur. Le hash stocké est `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`.

---

## Déroulement de l'application

### Navigation côté visiteur

1. **Page d'accueil** — L'utilisateur arrive sur la page principale qui affiche toutes les auberges enregistrées. Il peut filtrer par ville (Dakar, Saint-Louis, Saly, etc.) et par fourchette de prix en FCFA.

2. **Fiche auberge** — En cliquant sur une auberge, l'utilisateur accède au détail complet : galerie d'images avec navigation, description, adresse, lien vers le site web, et liste des chambres disponibles avec prix et capacité.

3. **Réservation** — L'utilisateur clique sur le bouton "Réserver" d'une chambre. Un formulaire de réservation s'ouvre demandant le nom complet, le numéro de téléphone, la date d'arrivée et la date de départ. Le coût total est calculé automatiquement.

4. **Confirmation WhatsApp** — Après soumission, la réservation est enregistrée en base avec le statut "En attente". Un bouton "Confirmer via WhatsApp" ouvre WhatsApp avec un message pré-rempli contenant les détails de la réservation (nom, chambre, dates).

### Navigation côté propriétaire

1. **Inscription** — Le propriétaire crée un compte avec email, nom complet et mot de passe. Le rôle par défaut est "owner".

2. **Connexion** — Le propriétaire se connecte via le formulaire de connexion. Une session est créée via un cookie `ac_session` contenant l'ID du profil.

3. **Dashboard — Vue d'ensemble** — Affiche les statistiques clés : nombre d'auberges, nombre total de chambres, réservations en attente et réservations confirmées.

4. **Dashboard — Mon Auberge** — Le propriétaire peut :
   - Créer une nouvelle auberge avec nom, ville, description, adresse, site web, téléphone et **jusqu'à 8 images via drag & drop** (ou sélection depuis la galerie)
   - Modifier une auberge existante
   - Voir ses auberges sous forme de cartes avec image de couverture

5. **Dashboard — Chambres** — Le propriétaire peut :
   - Ajouter une chambre en sélectionnant l'auberge, le nom, le prix par nuit (FCFA), la capacité et la disponibilité
   - Modifier ou supprimer une chambre
   - Basculer la disponibilité directement via un switch

6. **Dashboard — Réservations** — Le propriétaire peut :
   - Voir toutes les réservations avec filtrage par statut (En attente, Confirmée, Annulée)
   - Confirmer ou annuler une réservation en attente
   - Chaque action affiche une confirmation via une boîte de dialogue

### Flux d'upload d'images

1. Le propriétaire glisse-dépose des images dans la zone prévue, ou clique pour sélectionner depuis sa galerie
2. Les fichiers sont envoyés via `FormData` à l'API `/api/upload`
3. L'API valide le type (JPG, PNG, WebP, GIF) et la taille (max 5MB par image)
4. Les fichiers sont sauvegardés dans `/public/uploads/hostels/` avec un nom unique (UUID)
5. Les URLs publiques (`/uploads/hostels/uuid.jpg`) sont renvoyées et stockées dans le champ `images` de l'auberge (sérialisé en JSON)

---

## Schéma de la base de données

### Profile (Utilisateur)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| email | String (unique) | Adresse email |
| username | String? | Nom d'utilisateur |
| fullName | String? | Nom complet |
| role | String | Rôle ("owner" par défaut) |
| password | String | Mot de passe hashé (SHA-256) |
| phone | String? | Numéro de téléphone |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Hostel (Auberge)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| ownerId | String (FK) | Lien vers Profile (suppression en cascade) |
| name | String | Nom de l'auberge |
| description | String | Description (vide par défaut) |
| city | String | Ville |
| address | String | Adresse physique |
| images | String | Tableau JSON sérialisé d'URLs d'images |
| website | String? | Lien vers le site web |
| phone | String? | Numéro de téléphone |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Room (Chambre)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| hostelId | String (FK) | Lien vers Hostel (suppression en cascade) |
| name | String | Nom de la chambre |
| pricePerNight | Int | Prix par nuit en FCFA |
| capacity | Int | Capacité en personnes (1 par défaut) |
| isAvailable | Boolean | Disponibilité (true par défaut) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Booking (Réservation)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| roomId | String (FK) | Lien vers Room (suppression en cascade) |
| guestName | String | Nom du client |
| guestPhone | String | Téléphone du client |
| startDate | DateTime | Date d'arrivée |
| endDate | DateTime | Date de départ |
| status | String | Statut : "pending", "confirmed", "cancelled" |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Relations

```
Profile 1 ──< Hostel    (un propriétaire possède plusieurs auberges)
Hostel   1 ──< Room     (une auberge possède plusieurs chambres)
Room     1 ──< Booking  (une chambre possède plusieurs réservations)
```

Toutes les suppressions sont en cascade : supprimer une auberge supprime ses chambres et réservations, supprimer une chambre supprime ses réservations.

---

## API Routes

### Authentification

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| POST | `/api/auth/register` | Créer un compte | Non |
| POST | `/api/auth/login` | Se connecter | Non |
| POST | `/api/auth/logout` | Se déconnecter | Non |
| GET | `/api/auth/session` | Vérifier la session active | Non |

**Inscription** — Envoyer `{ email, password, fullName?, phone? }`. Retourne le profil créé et définit le cookie de session.

**Connexion** — Envoyer `{ email, password }`. Le mot de passe est comparé via hash SHA-256. Retourne le profil et définit le cookie `ac_session`.

### Auberges

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/hostels` | Lister toutes les auberges | Non |
| GET | `/api/hostels?city=Dakar` | Filtrer par ville | Non |
| GET | `/api/hostels?minPrice=10000&maxPrice=50000` | Filtrer par prix | Non |
| GET | `/api/hostels/[id]` | Détail d'une auberge | Non |
| POST | `/api/hostels` | Créer une auberge | Oui |
| PUT | `/api/hostels/[id]` | Modifier une auberge | Oui (propriétaire) |
| DELETE | `/api/hostels/[id]` | Supprimer une auberge | Oui (propriétaire) |

**Créer une auberge** — Envoyer `{ name, city, description?, address?, website?, phone?, images? }`. Le `ownerId` est automatiquement défini depuis la session.

### Chambres

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/rooms` | Lister les chambres | Non (publiques si disponibles) |
| GET | `/api/rooms?hostelId=xxx` | Chambres d'une auberge | Non |
| GET | `/api/rooms/[id]` | Détail d'une chambre | Non |
| POST | `/api/rooms` | Créer une chambre | Oui |
| PUT | `/api/rooms/[id]` | Modifier une chambre | Oui (propriétaire) |
| DELETE | `/api/rooms/[id]` | Supprimer une chambre | Oui (propriétaire) |

**Créer une chambre** — Envoyer `{ hostelId, name, pricePerNight, capacity? }`. L'API vérifie que l'auberge appartient au propriétaire connecté.

### Réservations

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/bookings` | Lister les réservations | Oui (propriétaire) |
| GET | `/api/bookings?status=pending` | Filtrer par statut | Oui |
| GET | `/api/bookings/[id]` | Détail d'une réservation | Oui |
| POST | `/api/bookings` | Créer une réservation | Non |
| PUT | `/api/bookings/[id]` | Modifier le statut | Oui (propriétaire) |
| DELETE | `/api/bookings/[id]` | Supprimer une réservation | Oui (propriétaire) |

**Créer une réservation** — Envoyer `{ roomId, guestName, guestPhone, startDate, endDate }`. Accessible sans authentification (visiteurs).

**Modifier le statut** — Envoyer `{ status: "confirmed" }` ou `{ status: "cancelled" }`.

### Upload

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| POST | `/api/upload` | Upload d'images | Oui |

**Upload** — Envoyer un `FormData` avec un champ `files` contenant jusqu'à 5 fichiers image (JPG, PNG, WebP, GIF). Taille maximale : 5MB par fichier. Retourne `{ urls: ["/uploads/hostels/uuid.jpg", ...] }`.

### Seed (Démonstration)

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/seed` | Peupler la base avec des données de démo | Non |

> Ne fonctionne que si la base est vide. Appeler une seule fois après l'initialisation.

---

## Déploiement en production

### Option 1 : Déploiement classique (VPS / Serveur dédié)

1. **Préparer le serveur**

```bash
# Installer Node.js 18+ et npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Cloner et installer**

```bash
git clone <url-du-repo>
cd aubergeconnect
npm install
```

3. **Configurer l'environnement de production**

Créer le fichier `.env` :

```env
DATABASE_URL=file:./db/production.db
# OU pour PostgreSQL :
# DATABASE_URL=postgresql://user:password@localhost:5432/aubergeconnect
```

4. **Initialiser la base**

```bash
npx prisma generate
npx prisma db push
```

5. **Builder l'application**

```bash
npm run build
```

Cette commande :
- Compile l'application Next.js en mode standalone
- Copie les fichiers statiques et le dossier `public` dans le bundle standalone

6. **Lancer en production**

```bash
npm run start
# ou directement :
NODE_ENV=production node .next/standalone/server.js
```

L'application tourne par défaut sur le port 3000. Pour changer le port :

```bash
PORT=8080 npm run start
```

7. **Configuration reverse proxy (Nginx recommandé)**

```nginx
server {
    listen 80;
    server_name aubergeconnect.sn www.aubergeconnect.sn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir les images uploadées directement (optionnel, pour les performances)
    location /uploads/ {
        alias /path/to/aubergeconnect/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;  # Autoriser l'upload d'images
}
```

8. **Process manager (PM2 recommandé)**

```bash
npm install -g pm2
pm2 start .next/standalone/server.js --name aubergeconnect -i max
pm2 save
pm2 startup
```

### Option 2 : Déploiement Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t aubergeconnect .
docker run -p 3000:3000 -v $(pwd)/data:/app/db aubergeconnect
```

### Option 3 : Déploiement Vercel

```bash
npm install -g vercel
vercel --prod
```

> Note : Vercel ne supporte pas SQLite. Pour Vercel, utiliser PostgreSQL (Supabase) comme indiqué dans la section migration ci-dessous.

### Variables d'environnement de production

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion à la base de données | `file:./db/production.db` (SQLite) ou `postgresql://...` (PostgreSQL) |
| `PORT` | Port du serveur (défaut: 3000) | `8080` |
| `NODE_ENV` | Environnement d'exécution | `production` |

### Considérations de sécurité pour la production

- **Mots de passe** : Actuellement hashés en SHA-256. Pour la production, migrer vers bcrypt (`npm install bcrypt`) pour un hachage plus sécurisé avec sel.
- **Sessions** : Actuellement basées sur un cookie contenant l'ID du profil. Pour la production, utiliser des tokens JWT signés ou des sessions server-side chiffrées.
- **Upload** : Limiter les types MIME et la taille des fichiers (déjà en place). Ajouter une validation antivirus pour les fichiers uploadés.
- **CORS** : Configurer les en-têtes CORS appropriés si l'API est appelée depuis un domaine différent.
- **HTTPS** : Obligatoire en production. Utiliser Let's Encrypt avec Nginx.
- **Sauvegardes** : Mettre en place des sauvegardes régulières de la base de données et du dossier `/public/uploads/`.

---

## Migration vers Supabase (Production)

La version actuelle utilise SQLite pour le développement local. Pour la production, il est recommandé de migrer vers **Supabase** (PostgreSQL managé avec authentification intégrée et Row Level Security).

### Étape 1 : Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un nouveau projet
2. Noter l'URL du projet et la clé anonyme
3. Récupérer la chaîne de connexion PostgreSQL depuis les paramètres

### Étape 2 : Mettre à jour le schéma Prisma

Modifier `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Étape 3 : Mettre à jour les variables d'environnement

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].supabase.co:5432/postgres"
```

### Étape 4 : Migrer la base

```bash
npx prisma migrate dev --name init_postgresql
npx prisma db push
```

### Étape 5 : Configurer Row Level Security (RLS)

Dans le dashboard Supabase, exécuter les politiques SQL suivantes :

```sql
-- Les propriétaires ne peuvent voir que leurs propres auberges
CREATE POLICY "Owners can view their own hostels"
  ON hostels FOR SELECT
  USING (owner_id = auth.uid()::text);

-- Les propriétaires ne peuvent modifier que leurs propres auberges
CREATE POLICY "Owners can update their own hostels"
  ON hostels FOR UPDATE
  USING (owner_id = auth.uid()::text);

-- Les visiteurs peuvent voir toutes les auberges
CREATE POLICY "Public can view hostels"
  ON hostels FOR SELECT
  USING (true);
```

### Étape 6 : Remplacer l'authentification par Supabase Auth

Installer le client Supabase :

```bash
npm install @supabase/supabase-js
```

Créer `src/lib/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Puis remplacer les routes `/api/auth/*` par les méthodes Supabase Auth :

```typescript
// Inscription
const { data, error } = await supabase.auth.signUp({ email, password })

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Déconnexion
const { error } = await supabase.auth.signOut()

// Vérifier la session
const { data: { session } } = await supabase.auth.getSession()
```

### Étape 7 : Stockage des images avec Supabase Storage

Remplacer le stockage local par Supabase Storage :

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('hostel-images')
  .upload(`${userId}/${filename}`, file)

// URL publique
const { data: { publicUrl } } = supabase.storage
  .from('hostel-images')
  .getPublicUrl(`${userId}/${filename}`)
```

Mettre à jour l'API `/api/upload/route.ts` pour utiliser Supabase Storage au lieu du système de fichiers local.

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement sur le port 3000 |
| `npm run build` | Compile l'application pour la production (mode standalone) |
| `npm run start` | Lance l'application en mode production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run db:push` | Synchronise le schéma Prisma avec la base |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate` | Crée et applique une migration |
| `npm run db:reset` | Réinitialise la base de données |

---

## Notes importantes

- **Devise** : Tous les prix sont en FCFA (Franc CFA)
- **Téléphone** : Les numéros sont au format international sans le `+` (ex: `221770000001`)
- **WhatsApp** : L'intégration utilise `wa.me/{numero}?text={message}` avec message pré-rempli en français
- **Villes supportées** : Dakar, Saint-Louis, Saly, Thies, Ziguinchor, Kaolack (extensible via la datalist)
- **Images** : Stockées en JSON sérialisé dans le champ `images` de Hostel. Pour la production, migrer vers Supabase Storage
- **Routing** : L'application utilise un routing SPA côté client via Zustand (pas de navigation Next.js traditionnelle)
- **Session** : Le cookie `ac_session` contient directement l'ID du profil. Pour la production, utiliser des sessions chiffrées ou JWT
