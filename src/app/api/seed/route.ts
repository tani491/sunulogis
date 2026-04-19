import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if data already exists
    const count = await db.hostel.count();
    if (count > 0) {
      return NextResponse.json({ message: 'Données déjà existantes', count });
    }

    // Create sample owner
    const owner = await db.profile.create({
      data: {
        email: 'demo@aubergeconnect.sn',
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // "password"
        fullName: 'Amadou Diallo',
        username: 'amadou',
        phone: '221770000001',
        role: 'owner',
      },
    });

    // Create sample hostels
    const hostel1 = await db.hostel.create({
      data: {
        ownerId: owner.id,
        name: 'Auberge de la Terranga',
        description: 'Une auberge chaleureuse au cœur de Dakar, idéale pour les voyageurs en quête d\'authenticité sénégalaise. Profitez d\'une vue imprenable sur l\'océan Atlantique et d\'un accueil chaleureux typiquement sénégalais.',
        city: 'Dakar',
        address: '45 Rue Carnot, Plateau, Dakar',
        phone: '221770000001',
        website: 'https://example.com/teranga',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        ]),
      },
    });

    const hostel2 = await db.hostel.create({
      data: {
        ownerId: owner.id,
        name: 'Case de Saint-Louis',
        description: 'Séjournez dans le patrimoine historique de Saint-Louis. Notre auberge vous transporte dans l\'époque coloniale avec tout le confort moderne. Située sur l\'île, à deux pas du pont Faidherbe.',
        city: 'Saint-Louis',
        address: '12 Rue Blanchot, Île Saint-Louis',
        phone: '221770000002',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ]),
      },
    });

    const hostel3 = await db.hostel.create({
      data: {
        ownerId: owner.id,
        name: 'Villa Saly Beach',
        description: 'Votre escapade balnéaire à Saly. Détendez-vous dans nos chambres face à la mer, avec piscine et accès direct à la plage. Parfait pour les vacances en famille ou entre amis.',
        city: 'Saly',
        address: 'Route de la Plage, Saly Portudal',
        phone: '221770000003',
        website: 'https://example.com/saly',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ]),
      },
    });

    // Create rooms for hostel 1
    await db.room.createMany({
      data: [
        { hostelId: hostel1.id, name: 'Chambre Océan', pricePerNight: 25000, capacity: 2, isAvailable: true },
        { hostelId: hostel1.id, name: 'Chambre Baobab', pricePerNight: 20000, capacity: 2, isAvailable: true },
        { hostelId: hostel1.id, name: 'Suite Terranga', pricePerNight: 45000, capacity: 4, isAvailable: true },
        { hostelId: hostel1.id, name: 'Dortoir Shared', pricePerNight: 10000, capacity: 6, isAvailable: true },
      ],
    });

    // Create rooms for hostel 2
    await db.room.createMany({
      data: [
        { hostelId: hostel2.id, name: 'Chambre Coloniale', pricePerNight: 22000, capacity: 2, isAvailable: true },
        { hostelId: hostel2.id, name: 'Chambre Fleuve', pricePerNight: 18000, capacity: 2, isAvailable: true },
        { hostelId: hostel2.id, name: 'Suite Gouverneur', pricePerNight: 40000, capacity: 3, isAvailable: false },
      ],
    });

    // Create rooms for hostel 3
    await db.room.createMany({
      data: [
        { hostelId: hostel3.id, name: 'Chambre Plage', pricePerNight: 30000, capacity: 2, isAvailable: true },
        { hostelId: hostel3.id, name: 'Suite Piscine', pricePerNight: 55000, capacity: 4, isAvailable: true },
        { hostelId: hostel3.id, name: 'Bungalow Jardin', pricePerNight: 35000, capacity: 3, isAvailable: true },
        { hostelId: hostel3.id, name: 'Chambre Familiale', pricePerNight: 42000, capacity: 5, isAvailable: true },
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

    return NextResponse.json({ message: 'Données de démonstration créées avec succès', owner, hostels: 3, rooms: 11, bookings: 3 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 });
  }
}
