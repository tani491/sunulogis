import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 8;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} fichiers autorisés` }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'hostels');

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Format de fichier invalide' }, { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé: ${file.type}. Utilisez JPG, PNG, WebP ou GIF.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Fichier trop volumineux: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 5MB.` },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      urls.push(`/uploads/hostels/${fileName}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
  }
}
