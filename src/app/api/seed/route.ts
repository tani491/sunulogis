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

    return NextResponse.json({ message: 'Données de démonstration créées avec succès', owners: 2, establishments: 5, rooms: 14, bookings: 3 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 });
  }
}
