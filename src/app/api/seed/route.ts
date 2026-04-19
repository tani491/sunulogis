import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Check if data already exists
    const count = await db.establishment.count();
    if (count > 0) {
      return NextResponse.json({ message: 'Données déjà existantes', count });
    }

    // Create admin user
    await db.profile.create({
      data: {
        email: 'admin@sunulogis.sn',
        password: hashPassword('admin123'),
        fullName: 'Admin SunuLogis',
        username: 'admin',
        role: 'admin',
        isActive: true,
      },
    });

    // Create sample owner
    const owner = await db.profile.create({
      data: {
        email: 'demo@sunulogis.sn',
        password: hashPassword('password'),
        fullName: 'Amadou Diallo',
        username: 'amadou',
        phone: '221770000001',
        role: 'owner',
        isActive: true,
      },
    });

    // Create second owner
    const owner2 = await db.profile.create({
      data: {
        email: 'fatou@sunulogis.sn',
        password: hashPassword('password'),
        fullName: 'Fatou Ndiaye',
        username: 'fatou',
        phone: '221770000002',
        role: 'owner',
        isActive: true,
      },
    });

    // Create client users
    await db.profile.createMany({
      data: [
        {
          email: 'client1@sunulogis.sn',
          password: hashPassword('password'),
          fullName: 'Moussa Sow',
          phone: '221769876543',
          role: 'client',
          isActive: true,
        },
        {
          email: 'client2@sunulogis.sn',
          password: hashPassword('password'),
          fullName: 'Aïssatou Ba',
          phone: '221778765432',
          role: 'client',
          isActive: true,
        },
      ],
    });

    // Create sample establishments
    const est1 = await db.establishment.create({
      data: {
        ownerId: owner.id,
        name: 'Auberge de la Terranga',
        type: 'auberge',
        description: 'Une auberge chaleureuse au cœur de Dakar, idéale pour les voyageurs en quête d\'authenticité sénégalaise. Profitez d\'une vue imprenable sur l\'océan Atlantique et d\'un accueil chaleureux typiquement sénégalais.',
        city: 'Dakar',
        region: 'Dakar',
        address: '45 Rue Carnot, Plateau, Dakar',
        phone: '221770000001',
        website: 'https://example.com/teranga',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        ]),
        isApproved: true,
        isSuspended: false,
      },
    });

    const est2 = await db.establishment.create({
      data: {
        ownerId: owner.id,
        name: 'Hôtel Saint-Louis',
        type: 'hotel',
        description: 'Séjournez dans le patrimoine historique de Saint-Louis. Notre hôtel vous transporte dans l\'époque coloniale avec tout le confort moderne. Situé sur l\'île, à deux pas du pont Faidherbe.',
        city: 'Saint-Louis',
        region: 'Saint-Louis',
        address: '12 Rue Blanchot, Île Saint-Louis',
        phone: '221770000002',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ]),
        isApproved: true,
        isSuspended: false,
      },
    });

    const est3 = await db.establishment.create({
      data: {
        ownerId: owner2.id,
        name: 'Villa Saly Beach',
        type: 'lodge',
        description: 'Votre escapade balnéaire à Saly. Détendez-vous dans nos chambres face à la mer, avec piscine et accès direct à la plage. Parfait pour les vacances en famille ou entre amis.',
        city: 'Saly',
        region: 'Thiès',
        address: 'Route de la Plage, Saly Portudal',
        phone: '221770000003',
        website: 'https://example.com/saly',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ]),
        isApproved: true,
        isSuspended: false,
      },
    });

    const est4 = await db.establishment.create({
      data: {
        ownerId: owner2.id,
        name: 'Appartement Almadies',
        type: 'appartement_meuble',
        description: 'Appartement meublé haut de gamme dans le quartier des Almadies. Idéal pour les séjours d\'affaires ou les vacances en famille. Cuisine équipée, climatisation et internet haut débit.',
        city: 'Dakar',
        region: 'Dakar',
        address: 'Rue des Almadies, Dakar',
        phone: '221770000004',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ]),
        isApproved: true,
        isSuspended: false,
      },
    });

    const est5 = await db.establishment.create({
      data: {
        ownerId: owner.id,
        name: 'Loft Gorée',
        type: 'loft',
        description: 'Loft moderne avec vue sur l\'île de Gorée. Un espace unique alliant design contemporain et charme sénégalais. Parfait pour une escapade culturelle.',
        city: 'Dakar',
        region: 'Dakar',
        address: 'Route de Gorée, Dakar',
        phone: '221770000005',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ]),
        isApproved: false,
        isSuspended: false,
      },
    });

    // Create rooms for establishment 1
    await db.room.createMany({
      data: [
        { establishmentId: est1.id, name: 'Chambre Océan', pricePerNight: 25000, capacity: 2, isAvailable: true },
        { establishmentId: est1.id, name: 'Chambre Baobab', pricePerNight: 20000, capacity: 2, isAvailable: true },
        { establishmentId: est1.id, name: 'Suite Terranga', pricePerNight: 45000, capacity: 4, isAvailable: true },
        { establishmentId: est1.id, name: 'Dortoir Shared', pricePerNight: 10000, capacity: 6, isAvailable: true },
      ],
    });

    // Create rooms for establishment 2
    await db.room.createMany({
      data: [
        { establishmentId: est2.id, name: 'Chambre Coloniale', pricePerNight: 22000, capacity: 2, isAvailable: true },
        { establishmentId: est2.id, name: 'Chambre Fleuve', pricePerNight: 18000, capacity: 2, isAvailable: true },
        { establishmentId: est2.id, name: 'Suite Gouverneur', pricePerNight: 40000, capacity: 3, isAvailable: false },
      ],
    });

    // Create rooms for establishment 3
    await db.room.createMany({
      data: [
        { establishmentId: est3.id, name: 'Chambre Plage', pricePerNight: 30000, capacity: 2, isAvailable: true },
        { establishmentId: est3.id, name: 'Suite Piscine', pricePerNight: 55000, capacity: 4, isAvailable: true },
        { establishmentId: est3.id, name: 'Bungalow Jardin', pricePerNight: 35000, capacity: 3, isAvailable: true },
        { establishmentId: est3.id, name: 'Chambre Familiale', pricePerNight: 42000, capacity: 5, isAvailable: true },
      ],
    });

    // Create rooms for establishment 4
    await db.room.createMany({
      data: [
        { establishmentId: est4.id, name: 'Studio Standing', pricePerNight: 35000, capacity: 2, isAvailable: true },
        { establishmentId: est4.id, name: 'Appartement 2 pièces', pricePerNight: 50000, capacity: 4, isAvailable: true },
      ],
    });

    // Create rooms for establishment 5
    await db.room.createMany({
      data: [
        { establishmentId: est5.id, name: 'Loft Supérieur', pricePerNight: 60000, capacity: 2, isAvailable: true },
      ],
    });

    // Create sample bookings
    const rooms = await db.room.findMany({ take: 3 });
    if (rooms.length >= 3) {
      await db.booking.createMany({
        data: [
          {
            roomId: rooms[0].id,
            guestName: 'Fatou Ndiaye',
            guestPhone: '221771234567',
            startDate: new Date('2026-05-01'),
            endDate: new Date('2026-05-05'),
            status: 'pending',
          },
          {
            roomId: rooms[1].id,
            guestName: 'Jean Dupont',
            guestPhone: '33612345678',
            startDate: new Date('2026-05-10'),
            endDate: new Date('2026-05-14'),
            status: 'confirmed',
          },
          {
            roomId: rooms[2].id,
            guestName: 'Moussa Sow',
            guestPhone: '221769876543',
            startDate: new Date('2026-04-20'),
            endDate: new Date('2026-04-23'),
            status: 'pending',
          },
        ],
      });
    }

    // Create sample blog posts
    const admin = await db.profile.findFirst({ where: { role: 'admin' } });
    if (admin) {
      await db.blogPost.createMany({
        data: [
          {
            title: 'Les 10 plages incontournables du Sénégal',
            slug: 'les-10-plages-incontournables-du-senegal',
            excerpt: 'Découvrez les plus belles plages du Sénégal, des côtes de Dakar aux plages paradisiaques de la Casamance.',
            content: `Le Sénégal possède un littoral exceptionnel de plus de 500 km, bordé par l'océan Atlantique. Des plages urbanisées de Dakar aux criques sauvages de la Casamance, chaque coin de côte offre une expérience unique.

## 1. Plage de Ngor, Dakar
Située sur l'île de Ngor, cette plage est l'une des plus accessibles depuis le centre-ville de Dakar. Ses eaux calmes et son sable fin en font un spot prisé des familles et des surfeurs débutants.

## 2. Plage de Saly Portudal
À environ 80 km de Dakar, Saly est la station balnéaire la plus populaire du Sénégal. Ses plages de sable blanc, bordées de palmiers, offrent un cadre idyllique pour la baignade et les sports nautiques.

## 3. Cap Skirring, Casamance
Au sud du pays, le Cap Skirring est un véritable paradis terrestre. Ses plages infinies de sable fin, ses cocoteraies et ses eaux turquoise rappellent les plus belles cartes postales des Caraïbes.

## 4. Plage de Somone
Ce village paisible abrite une lagune protégée, idéale pour le kayak et l'observation des oiseaux. La plage océane, plus sauvage, est parfaite pour les amateurs de tranquillité.

## 5. Plage du Lac Rose
À quelques kilomètres de Dakar, le Lac Rose (ou Lac Retba) doit sa couleur rose éclatante à la présence de micro-algues. Les dunes de sable environnantes offrent un paysage lunaire unique.

Préparez votre maillot et votre crème solaire, le Sénégal vous attend !`,
            coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            category: 'voyage',
            isPublished: true,
            authorId: admin.id,
          },
          {
            title: 'La culture de la Teranga : l\'hospitalité sénégalaise',
            slug: 'la-culture-de-la-teranga-lhospitalite-senegalaise',
            excerpt: 'Comprendre la Teranga, cette valeur fondamentale de l\'hospitalité sénégalaise qui fait du Sénégal le pays du bienvenue.',
            content: `La Teranga est bien plus qu'un simple mot wolof signifiant "hospitalité". C'est un art de vivre, une philosophie profonde qui imprègne chaque aspect de la société sénégalaise. Du partage du thé à la cérémonie du ndaw, la Teranga est le ciment social du pays.

## Qu'est-ce que la Teranga ?
La Teranga se traduit littéralement par "l'accueil chaleureux". Mais dans la pratique, elle englobe la générosité, le respect de l'autre, le partage et la solidarité. Un Sénégalais ne laisse jamais un visiteur repartir sans avoir partagé un repas ou un verre de thé.

## Les trois temps du thé
L'attaya, la cérémonie du thé à la menthe, est l'expression quotidienne de la Teranga. Elle se déroule en trois services : le premier est amer comme la vie, le deuxième est doux comme l'amour, le troisième est sucré comme la mort. Chaque tasse est l'occasion de discuter, de rire et de renforcer les liens.

## Le ndaw, le partage communautaire
Le ndaw est un repas partagé dans un grand plat commun. Chaque convive mange dans la portion qui lui fait face, symbolisant le respect de l'autre et l'égalité. C'est autour du ndaw que se transmettent les histoires, les proverbes et la sagesse ancestrale.

## La Teranga aujourd'hui
Dans un monde de plus en plus individualiste, la Teranga reste un pilier de l'identité sénégalaise. Elle fait du Sénégal une destination unique où chaque voyageur se sent chez lui, accueilli avec sincérité et chaleur.`,
            coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
            category: 'culture',
            isPublished: true,
            authorId: admin.id,
          },
          {
            title: 'Guide pratique : préparer son voyage au Sénégal',
            slug: 'guide-pratique-preparer-son-voyage-au-senegal',
            excerpt: 'Tout ce que vous devez savoir avant de partir au Sénégal : formalités, santé, budget, transport et conseils pratiques.',
            content: `Le Sénégal est l'une des destinations les plus accessibles d'Afrique de l'Ouest. Voici un guide complet pour préparer votre séjour en toute sérénité.

## Formalités d'entrée
Les ressortissants de nombreux pays n'ont pas besoin de visa pour un séjour touristique de moins de 90 jours. Un passeport valide (6 mois minimum) suffit. Vérifiez les conditions spécifiques à votre nationalité avant le départ.

## Santé et vaccinations
Les vaccinations recommandées incluent la fièvre jaune (obligatoire si vous venez d'une zone endémique), l'hépatite A et B, la typhoïde et le tétanos. Un traitement antipaludéen est conseillé, surtout si vous visitez les régions du sud (Casamance).

## Budget
Le Sénégal est une destination abordable. Comptez environ :
- 15 000 à 25 000 FCFA par jour en budget économique
- 30 000 à 50 000 FCFA en budget moyen
- 80 000+ FCFA pour un séjour haut de gamme

## Transport
- L'aéroport international Blaise Diagne (AIBD) dessert Dakar
- Les taxis sont abordables en ville (négociez la course à l'avance)
- Les "sept-places" (taxis partagés) relient les villes
- La location de voiture est possible mais la conduite peut être sportive

## Quand partir ?
La meilleure période est de novembre à mai (saison sèche). Évitez la saison des pluies (juillet à octobre) si vous souhaitez profiter des plages et des visites en plein air.

## À ne pas manquer
- L'île de Gorée et sa Maison des Esclaves
- Le Parc National du Djoudj (oiseaux)
- Le Lac Rose
- Les marchés de Dakar (Sandaga, Kermel)
- Saint-Louis et son festival de jazz`,
            coverImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
            category: 'guide',
            isPublished: true,
            authorId: admin.id,
          },
          {
            title: 'SunuLogis lance sa plateforme de réservation au Sénégal',
            slug: 'sunulogis-lance-sa-plateforme-de-reservation-au-senegal',
            excerpt: 'SunuLogis, la nouvelle plateforme de réservation d\'hébergements 100% sénégalaise, est maintenant disponible dans les 14 régions du pays.',
            content: `Nous sommes fiers d'annoncer le lancement officiel de SunuLogis, la première plateforme de réservation d'hébergements dédiée au marché sénégalais. Que vous cherchiez une auberge à Dakar, un lodge à Saly ou un appartement meublé à Saint-Louis, SunuLogis vous accompagne.

## Une plateforme 100% sénégalaise
Contrairement aux plateformes internationales, SunuLogis a été conçue spécifiquement pour le marché sénégalais. Nous comprenons les besoins locaux : paiement en FCFA, intégration WhatsApp, régions du Sénégal, et une expérience adaptée aux réalités du terrain.

## Pour les voyageurs
- Recherchez par région, type d'établissement ou budget
- Consultez les détails et les photos des établissements
- Réservez directement via WhatsApp avec le propriétaire
- Pas besoin de créer un compte pour réserver

## Pour les propriétaires
- Créez et gérez vos établissements en quelques clics
- Ajoutez vos chambres avec photos par drag & drop
- Recevez les demandes de réservation directement
- Un dashboard complet pour suivre votre activité

## 14 régions couvertes
De Dakar à Kédougou, de Saint-Louis à Ziguinchor, SunuLogis couvre l'intégralité du territoire sénégalais. Notre objectif : rendre l'hébergement accessible partout au Sénégal.

Rejoignez-nous et découvrez le Sénégal autrement !`,
            coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            category: 'actu',
            isPublished: true,
            authorId: admin.id,
          },
        ],
      });
    }

    return NextResponse.json({ message: 'Données de démonstration créées avec succès', owners: 2, establishments: 5, rooms: 14, bookings: 3, blogPosts: 4 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 });
  }
}
