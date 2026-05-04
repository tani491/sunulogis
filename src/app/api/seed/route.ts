import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. On crée le mot de passe crypté
    const hashedPassword = await bcrypt.hash("TonMotDePasseDakar2026!", 10);

    // 2. On crée (ou met à jour) l'Admin dans la table User
    const admin = await prisma.user.upsert({
      where: { email: "admin@sunulogis.sn" }, // METS TON EMAIL ICI
      update: {
        role: "admin",
        password: hashedPassword,
      },
      create: {
        email: "admin@sunulogis.sn", // METS TON EMAIL ICI
        name: "Admin SunuLogis",
        password: hashedPassword,
        role: "admin",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Base de données initialisée !", 
      admin: admin.email 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur de seeding" }, { status: 500 });
  }
}