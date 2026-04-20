# SunuLogis

**Plateforme SaaS de réservation d'hébergements pour le marché sénégalais**

SunuLogis est une application web qui permet aux voyageurs de trouver et réserver des hébergements au Sénégal (auberges, hôtels, appartements, appartements meublés, lodges, lofts), tout en offrant aux propriétaires un dashboard de gestion complet. Les réservations se confirment via WhatsApp.

---

## Sommaire

- [Connexion et Rôles](#connexion-et-rôles)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation locale](#installation-locale)
- [Identifiants de démonstration](#identifiants-de-démonstration)
- [Déroulement de l'application](#déroulement-de-lapplication)
- [Schéma de la base de données](#schéma-de-la-base-de-données)
- [API Routes](#api-routes)
- [Blog](#blog)
- [Déploiement en production](#déploiement-en-production)
- [Migration vers Supabase (Production)](#migration-vers-supabase-production)
- [Scripts disponibles](#scripts-disponibles)

---

## Connexion et Rôles

SunuLogis utilise un système de 3 rôles avec des accès et flux de connexion différents :

### Client (Voyageur)

| Aspect | Détail |
|---|---|
| **Inscription** | Pas obligatoire. Le client peut parcourir et réserver sans compte |
| **Connexion** | Non requise pour utiliser la plateforme |
| **Accès** | Page d'accueil, liste des établissements, fiches détail, réservation via WhatsApp, blog |
| **Interdictions** | Ne peut pas accéder au dashboard propriétaire ni au panneau admin |
| **Flux** | Arrive sur la Landing Page → Clique "Je cherche un logement" → Explore les établissements → Réserve via WhatsApp |

### Owner (Propriétaire)

| Aspect | Détail |
|---|---|
| **Inscription** | Obligatoire via le formulaire d'inscription (rôle "owner") |
| **Connexion** | Email + mot de passe sur la page de connexion |
| **Accès** | Dashboard propriétaire (établissements, chambres, réservations) + tout ce que le client peut faire |
| **Interdictions** | Ne peut pas accéder au panneau admin, ne voit que ses propres données |
| **Flux** | Clique "Je propose un logement" sur la Landing Page → S'inscrit → Se connecte → Accède à son Espace Gestion |

**Formulaire d'inscription propriétaire** : email (obligatoire), nom complet, téléphone, mot de passe (obligatoire). Le rôle est automatiquement défini sur "owner".

### Admin (Super-Admin)

| Aspect | Détail |
|---|---|
| **Inscription** | Impossible depuis l'interface publique. L'admin est créé manuellement en base ou via le seed |
| **Connexion** | Email + mot de passe sur la page de connexion classique |
| **Accès** | Panneau Admin complet (validation établissements, gestion utilisateurs, blog, statistiques) + tout le reste |
| **Pouvoirs spéciaux** | Valider/suspendre des établissements, désactiver des comptes propriétaires, gérer le blog |
| **Flux** | Se connecte avec ses identifiants admin → Accède automatiquement au Panel Admin |

**Important** : Si un propriétaire ne paie pas son abonnement, l'admin peut suspendre son établissement depuis le panneau admin. L'établissement sera alors invisible publiquement.

### Vérification de session

La session est gérée via un cookie `ac_session` contenant l'ID du profil. À chaque connexion :
1. L'email et le mot de passe sont vérifiés (hash SHA-256)
2. Si le compte est désactivé (`isActive: false`), la connexion est refusée
3. Le cookie de session est défini avec l'ID du profil
4. Le rôle détermine la vue par défaut après connexion (admin → Panel Admin, owner → Dashboard)

---

## Fonctionnalités

### Interface publique (visiteurs/clients)

| Fonctionnalité | Description |
|---|---|
| Landing Page | Hero carousel + 2 CTA (voyageur / propriétaire) + établissements en vedette + derniers articles du blog |
| Recherche | Barre sticky dans la Navbar avec filtres région, budget et recherche textuelle |
| Établissements | Liste filtrée par type (Auberge, Hôtel, Appartement, Appartement Meublé, Lodge, Loft), région et prix |
| Fiche établissement | Détail complet : images, type, description, région, adresse, chambres disponibles |
| Réservation | Formulaire avec calcul automatique du coût total |
| Confirmation WhatsApp | Lien pré-rempli `wa.me` avec message de réservation |
| Blog | Articles publics avec filtres par catégorie (Voyage, Culture, Guide, Actu) |
| Newsletter | Formulaire d'inscription dans le footer et sur le blog pour recevoir les offres |

### Dashboard propriétaire (Owner)

| Fonctionnalité | Description |
|---|---|
| Inscription / Connexion | Authentification par email et mot de passe, rôle "owner" |
| Vue d'ensemble | Statistiques : établissements, chambres, réservations en attente/confirmées |
| Gestion des établissements | CRUD complet avec type, région, upload d'images par drag & drop |
| Statut d'approbation | L'owner voit si son établissement est en attente de validation admin |
| Gestion des chambres | CRUD complet avec prix, capacité, disponibilité |
| Gestion des réservations | Liste avec filtres, confirmation / annulation |
| Alerte commission | Alerte visuelle si commission impayée avec instructions de paiement Wave |

### Panneau Admin (Super-Admin)

| Fonctionnalité | Description |
|---|---|
| Vue d'ensemble | Statistiques globales de la plateforme |
| Gestion des établissements | Valider/refuser les nouveaux établissements, suspendre/réactiver |
| Gestion des utilisateurs | Voir tous les comptes, activer/désactiver un propriétaire |
| Blog | Créer, modifier, supprimer des articles (éditeur avec catégories, image de couverture, brouillon/publié) |
| Commissions | Vue globale des revenus, suivi des paiements par établissement, confirmer les paiements |
| Newsletter | Liste des abonnés email, export CSV pour marketing, statistiques |

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
| Framer Motion | 12.x | Animations de transition entre les pages |

---

## Installation locale

### Prérequis

- **Node.js** 18+ ou **Bun** (recommandé)
- **npm** ou **bun** comme gestionnaire de paquets

### Étapes d'installation

1. **Cloner le dépôt et installer les dépendances**

```bash
git clone <url-du-repo>
cd sunulogis
npm install
```

> ⚠️ `npm install` lance automatiquement `prisma generate` grâce au script `postinstall`.

2. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="file:./db/custom.db"
```

> Le chemin `./db/custom.db` est relatif au dossier du projet et fonctionne sur **Windows, Mac et Linux**.

3. **Initialiser la base de données**

```bash
npm run db:push
```

> Cela crée le dossier `db/` et le fichier `custom.db` automatiquement.

4. **Peupler la base avec les données de démonstration**

Lancer le serveur puis visiter l'URL de seed :

```bash
npm run dev
```

Ouvrir un navigateur sur : **http://localhost:3000/api/seed**

Cela crée automatiquement :
- 1 admin, 2 propriétaires, 2 clients
- 6 établissements (5 approuvés, 1 en attente)
- 16 chambres
- 3 réservations
- 4 articles de blog
- 5 abonnés newsletter

5. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**

---

### Installation sur Windows (étapes détaillées)

Si vous êtes sur Windows avec PowerShell :

```powershell
# 1. Aller dans le dossier du projet
cd C:\xampp\htdocs\sunulogie

# 2. Supprimer l'ancien node_modules (si existe)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 3. Installer les dépendances
npm install

# 4. Créer la base de données
npm run db:push

# 5. Créer le dossier pour les uploads d'images
mkdir public\uploads\hostels -Force

# 6. Lancer le serveur
npm run dev
```

Puis ouvrir **http://localhost:3000/api/seed** dans le navigateur pour les données de démo

L'application est accessible sur **http://localhost:3000**

---

## Identifiants de démonstration

| Rôle | Email | Mot de passe | Accès après connexion |
|---|---|---|---|
| **Admin** | `admin@sunulogis.sn` | `admin123` | Panel Admin (validation, utilisateurs, blog) |
| **Owner 1** | `demo@sunulogis.sn` | `password` | Dashboard propriétaire (3 établissements) |
| **Owner 2** | `fatou@sunulogis.sn` | `password` | Dashboard propriétaire (2 établissements) |
| **Client** | Pas besoin de compte | — | Parcours public + réservation WhatsApp |

> Les mots de passe sont hashés en SHA-256 côté serveur.

---

## Déroulement de l'application

### Navigation côté client (voyageur)

1. **Landing Page** — L'utilisateur arrive sur la page avec le carousel et deux CTA. S'il cherche un logement, il clique "Je cherche un logement".

2. **Recherche** — La barre de recherche sticky dans la Navbar permet de filtrer par région (14 régions du Sénégal), budget et texte. Les types d'établissement (Auberge, Hôtel, Appartement, Appartement Meublé, Lodge, Loft) sont aussi filtrables.

3. **Fiche établissement** — L'utilisateur voit le détail complet avec galerie d'images, badge de type, région, chambres et prix.

4. **Réservation** — Le client clique "Réserver", remplit le formulaire (nom, téléphone, dates) et le coût total est calculé automatiquement.

5. **Confirmation WhatsApp** — Après soumission, un bouton "Confirmer via WhatsApp" ouvre WhatsApp avec un message pré-rempli.

6. **Blog** — L'utilisateur peut lire les articles de blog (conseils voyage, guides, culture, actualités).

### Navigation côté propriétaire (owner)

1. **Inscription** — Depuis la Landing Page, clique "Je propose un logement" → formulaire d'inscription avec rôle propriétaire.

2. **Connexion** — Email + mot de passe → redirection vers le Dashboard.

3. **Espace Gestion** — Vue d'ensemble avec statistiques, puis gestion de ses établissements, chambres et réservations.

4. **Création d'établissement** — Sélection du type (Auberge/Hôtel/Appartement/Appartement Meublé/Lodge/Loft), région, upload d'images par drag & drop. L'établissement est en attente de validation admin.

5. **Gestion des chambres** — Ajout avec prix FCFA, capacité, disponibilité. Sélection de l'établissement via le composant Select.

### Navigation côté admin (super-admin)

1. **Connexion** — Email admin + mot de passe → redirection automatique vers le Panel Admin.

2. **Vue d'ensemble** — Stats plateforme (propriétaires, établissements, chambres, réservations, approbations en attente).

3. **Établissements** — Valider les nouveaux établissements, suspendre ceux dont le propriétaire ne paie pas.

4. **Utilisateurs** — Liste de tous les comptes, désactiver un propriétaire problématique.

5. **Blog** — Créer/rédiger des articles avec titre, catégorie, extrait, contenu, image de couverture (drag & drop), statut brouillon/publié.

---

## Schéma de la base de données

### Profile (Utilisateur)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| email | String (unique) | Adresse email |
| username | String? | Nom d'utilisateur |
| fullName | String? | Nom complet |
| role | String | Rôle : "client", "owner", "admin" |
| password | String? | Mot de passe hashé (SHA-256), optionnel pour les clients |
| phone | String? | Numéro de téléphone |
| isActive | Boolean | Compte actif (true par défaut). Admin peut désactiver |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Establishment (Établissement)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| ownerId | String (FK) | Lien vers Profile (suppression en cascade) |
| name | String | Nom de l'établissement |
| type | String | Type : "auberge", "hotel", "appartement", "appartement_meuble", "lodge", "loft" |
| description | String | Description |
| city | String | Ville |
| region | String | Région (14 régions du Sénégal) |
| address | String | Adresse physique |
| images | String | Tableau JSON sérialisé d'URLs d'images |
| website | String? | Lien vers le site web |
| phone | String? | Numéro de téléphone |
| isApproved | Boolean | Approuvé par l'admin (false par défaut) |
| isSuspended | Boolean | Suspendu par l'admin (false par défaut) |
| commission | Int | Montant de la commission en FCFA (0 par défaut) |
| paymentStatus | String | Statut : "en_attente" ou "paye" |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Room (Chambre)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| establishmentId | String (FK) | Lien vers Establishment (suppression en cascade) |
| name | String | Nom de la chambre |
| pricePerNight | Int | Prix par nuit en FCFA |
| capacity | Int | Capacité en personnes (1 par défaut) |
| isAvailable | Boolean | Disponibilité (true par défaut) |

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

### BlogPost (Article de blog)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| title | String | Titre de l'article |
| slug | String (unique) | Slug URL (généré depuis le titre) |
| excerpt | String | Extrait / résumé court |
| content | String | Contenu complet de l'article |
| coverImage | String? | URL de l'image de couverture |
| category | String | Catégorie : "general", "voyage", "culture", "guide", "actu" |
| isPublished | Boolean | Publié (true) ou brouillon (false) |
| authorId | String (FK) | Lien vers Profile (admin, suppression en cascade) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Subscriber (Abonné Newsletter)

| Champ | Type | Description |
|---|---|---|
| id | String (cuid) | Identifiant unique |
| email | String (unique) | Adresse email |
| consentStatus | Boolean | Consentement reçu (true par défaut) |
| source | String | Provenance : "footer", "blog", "landing" |
| createdAt | DateTime | Date d'inscription |

### Relations

```
Profile 1 ──< Establishment  (un propriétaire possède plusieurs établissements)
Profile 1 ──< BlogPost       (un admin écrit plusieurs articles)
Establishment 1 ──< Room     (un établissement possède plusieurs chambres)
Room     1 ──< Booking       (une chambre possède plusieurs réservations)
Subscriber (indépendant, pas de relation FK)
```

---

## API Routes

### Authentification

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| POST | `/api/auth/register` | Créer un compte (owner ou client) | Non |
| POST | `/api/auth/login` | Se connecter | Non |
| POST | `/api/auth/logout` | Se déconnecter | Non |
| GET | `/api/auth/session` | Vérifier la session active | Non |

### Établissements

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/establishments` | Liste des établissements approuvés | Non |
| GET | `/api/establishments?city=Dakar&region=Dakar&type=hotel&minPrice=10000&maxPrice=50000` | Filtres avancés | Non |
| GET | `/api/establishments/[id]` | Détail d'un établissement | Non |
| POST | `/api/establishments` | Créer un établissement (isApproved=false par défaut) | Owner |
| PUT | `/api/establishments/[id]` | Modifier un établissement | Owner (propriétaire) ou Admin |
| DELETE | `/api/establishments/[id]` | Supprimer un établissement | Owner (propriétaire) ou Admin |

### Chambres

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/rooms` | Lister les chambres | Non |
| GET | `/api/rooms?establishmentId=xxx` | Chambres d'un établissement | Non |
| POST | `/api/rooms` | Créer une chambre | Owner |
| PUT | `/api/rooms/[id]` | Modifier une chambre | Owner |
| DELETE | `/api/rooms/[id]` | Supprimer une chambre | Owner |

### Réservations

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/bookings` | Lister les réservations | Owner |
| POST | `/api/bookings` | Créer une réservation | Non (client) |
| PUT | `/api/bookings/[id]` | Modifier le statut | Owner |
| DELETE | `/api/bookings/[id]` | Supprimer | Owner |

### Blog

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/blog` | Articles publiés (public) | Non |
| GET | `/api/blog?category=voyage` | Filtrer par catégorie | Non |
| GET | `/api/blog/[slug]` | Article publié par slug | Non |
| GET | `/api/blog/all` | Tous les articles y compris brouillons | Admin |
| POST | `/api/blog` | Créer un article | Admin |
| PUT | `/api/blog/[slug]` | Modifier un article | Admin |
| DELETE | `/api/blog/[slug]` | Supprimer un article | Admin |

### Admin

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/admin` | Statistiques de la plateforme | Admin |
| GET | `/api/admin/establishments` | Tous les établissements (y compris non approuvés) | Admin |
| PUT | `/api/admin/establishments` | Approuver/suspendre un établissement | Admin |
| GET | `/api/admin/users` | Tous les utilisateurs | Admin |
| PUT | `/api/admin/users` | Activer/désactiver un utilisateur | Admin |
| GET | `/api/admin/commissions` | Vue globale des commissions et revenus | Admin |
| PUT | `/api/admin/commissions` | Mettre à jour le statut de paiement d'une commission | Admin |

### Newsletter (Subscribers)

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| POST | `/api/subscribers` | S'inscrire à la newsletter (email + source) | Non |
| GET | `/api/subscribers` | Liste de tous les abonnés | Admin |
| DELETE | `/api/subscribers?id=xxx` | Supprimer un abonné | Admin |
| GET | `/api/subscribers/export` | Exporter la liste en CSV | Admin |

### Upload

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| POST | `/api/upload` | Upload d'images (max 5 fichiers, 5MB chacun) | Oui |

### Seed (Démonstration)

| Méthode | Route | Description | Auth requis |
|---|---|---|---|
| GET | `/api/seed` | Peupler la base avec des données de démo | Non |

> Ne fonctionne que si la base est vide. Appeler une seule fois.

---

## Blog

Le blog est géré exclusivement par l'admin depuis le Panel Admin.

### Fonctionnement

1. **L'admin crée un article** depuis le Panel Admin → Blog → "Nouvel article"
2. Il remplit le titre (le slug est auto-généré), la catégorie, l'extrait, le contenu
3. Il peut ajouter une image de couverture via drag & drop
4. Il choisit le statut : Brouillon (isPublished=false) ou Publié (isPublished=true)
5. Seuls les articles publiés sont visibles par les visiteurs

### Catégories disponibles

| Valeur | Label | Couleur |
|---|---|---|
| general | Général | Gris |
| voyage | Voyage | Bleu |
| culture | Culture | Violet |
| guide | Guide | Vert |
| actu | Actualités | Orange |

### Affichage public

- **Page Blog** : Grille d'articles avec filtres par catégorie, cartes avec image, badge catégorie, titre, extrait, auteur, date
- **Page Article** : Image de couverture hero, titre, catégorie, auteur, date, temps de lecture estimé, contenu formaté, sidebar avec articles récents
- **Landing Page** : Section "Derniers articles" affichant les 3 articles les plus récents

### Format du contenu

Le contenu est rédigé en texte brut avec un formatage simple :
- `## Titre` pour les titres de section (h2)
- `### Sous-titre` pour les sous-titres (h3)
- `- Élément` pour les listes à puces
- Sauts de ligne pour les paragraphes

---

## Newsletter (Collecte Marketing)

Le système de newsletter permet de collecter les emails des visiteurs pour le marketing.

### Fonctionnement

1. **Formulaire dans le Footer** : Présent sur toutes les pages publiques, permet une inscription rapide
2. **Formulaire sur le Blog** : Carte newsletter attractive en bas de la page blog
3. **Landing Page** : Formulaire intégré pour capturer les visiteurs intéressés

### Données collectées

| Champ | Description |
|---|---|
| email | Adresse email (unique) |
| consentStatus | Consentement reçu (true par défaut) |
| source | Provenance : "footer", "blog", "landing" |
| createdAt | Date d'inscription |

### Côté Admin (Halima)

- **Vue Newsletter** : Liste de tous les abonnés avec email, source et date
- **Export CSV** : Bouton pour télécharger la liste complète en CSV (compatible Excel, Mailchimp, etc.)
- **Suppression** : Possibilité de supprimer un abonné
- **Statistiques** : Total abonnés, répartition par source, inscriptions du mois

---

## Système de Commissions

Chaque établissement approuvé génère une commission mensuelle que le propriétaire doit régler.

### Barème des commissions

| Type d'établissement | Commission mensuelle (FCFA) |
|---|---|
| Auberge | 1 000 |
| Hôtel | 3 000 |
| Appartement | 2 500 |
| Appartement Meublé | 2 500 |
| Lodge | 2 500 |
| Loft | 2 500 |

### Suivi des paiements

| Champ | Description |
|---|---|
| commission | Montant en FCFA (calculé automatiquement selon le type) |
| paymentStatus | "en_attente" ou "paye" |

### Côté Propriétaire (Dashboard)

- **Alerte visuelle rouge** si une commission est impayée
- Message : "Commission en attente. Merci de régler [Montant] FCFA via Wave au 773615944 (Halima)"
- Détail par établissement avec le montant attendu
- Total à payer affiché clairement

### Côté Admin (Halima)

- **Vue Commissions** : Tableau global de tous les établissements avec statut de paiement
- **Statistiques** : Revenus attendus, commissions payées, impayés, nombre d'établissements en attente
- **Validation** : Bouton "Confirmer paiement" pour marquer une commission comme payée
- **Filtres** : Filtrer par statut (payé / impayé)

---

## Déploiement en production

### Option 1 : VPS classique (Nginx + PM2)

```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner et installer
git clone <url-du-repo>
cd sunulogis
npm install

# Configurer .env
echo 'DATABASE_URL=file:./db/production.db' > .env

# Initialiser la base
npx prisma generate
npx prisma db push

# Builder
npm run build

# Lancer avec PM2
npm install -g pm2
pm2 start .next/standalone/server.js --name sunulogis -i max
pm2 save && pm2 startup
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name sunulogis.sn www.sunulogis.sn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /path/to/sunulogis/public/uploads/;
        expires 30d;
    }

    client_max_body_size 10M;
}
```

### Option 2 : Docker

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
EXPOSE 3000
CMD ["node", "server.js"]
```

### Variables d'environnement de production

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion | `file:./db/production.db` (SQLite) ou `postgresql://...` |
| `PORT` | Port du serveur | `8080` |
| `NODE_ENV` | Environnement | `production` |

### Sécurité production

- **Mots de passe** : Migrer de SHA-256 vers bcrypt
- **Sessions** : Utiliser JWT signés au lieu du cookie d'ID brut
- **HTTPS** : Obligatoire (Let's Encrypt)
- **Upload** : Validation type/taille déjà en place. Ajouter antivirus.
- **Sauvegardes** : Base de données + dossier `/public/uploads/`

---

## Migration vers Supabase (Production)

1. Créer un projet Supabase
2. Modifier `prisma/schema.prisma` : `provider = "postgresql"`, ajouter `directUrl`
3. Mettre à jour `.env` avec les URLs PostgreSQL Supabase
4. Configurer Row Level Security (RLS) pour isoler les données par propriétaire
5. Remplacer l'auth SHA-256 par Supabase Auth
6. Remplacer le stockage local par Supabase Storage pour les images

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
- **Téléphone** : Format international sans le `+` (ex: `221770000001`)
- **WhatsApp** : Intégration `wa.me/{numero}?text={message}` avec message pré-rempli
- **14 régions** : Dakar, Diourbel, Fatick, Kaffrine, Kaolack, Kédougou, Kolda, Louga, Matam, Sédhiou, Saint-Louis, Tambacounda, Thiès, Ziguinchor
- **6 types d'établissements** : Auberge, Hôtel, Appartement, Appartement Meublé, Lodge, Loft
- **Approbation** : Les nouveaux établissements doivent être validés par l'admin avant d'être visibles publiquement
- **Suspension** : L'admin peut suspendre un établissement (invisible publiquement) ou désactiver un compte propriétaire
- **Routing** : SPA via Zustand (pas de navigation Next.js traditionnelle)
- **Session** : Cookie `ac_session` avec ID du profil. Pour la production, utiliser JWT
- **Blog** : Géré uniquement par l'admin, avec catégories et statut brouillon/publié
