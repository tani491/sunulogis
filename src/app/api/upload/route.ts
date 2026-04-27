import { randomUUID } from 'crypto'
import path from 'path'
import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

// Bucket Supabase Storage — créer ce bucket dans le dashboard Supabase (public)
const BUCKET = 'hostels'

function getExtension(file: File) {
  const extFromName = path.extname(file.name || '').toLowerCase()
  if (extFromName) return extFromName
  const fallback: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }
  return fallback[file.type] || '.bin'
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files').filter((e): e is File => e instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `${file.name} n'est pas une image valide` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} dépasse 5MB` },
          { status: 400 }
        )
      }

      const extension = getExtension(file)
      const filename = `${Date.now()}-${randomUUID()}${extension}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error } = await supabaseAdmin.storage
        .from('hotels')
        .upload(filename, buffer, { contentType: file.type, upsert: false })

      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
      }

      const { data } = supabaseAdmin.storage.from('hotels').getPublicUrl(filename)
      urls.push(data.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}
