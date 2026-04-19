import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const posts = await db.blogPost.findMany({
      where: {
        isPublished: true,
        ...(category && category !== 'all' ? { category } : {}),
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, category, isPublished } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Titre et slug requis' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 });
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content: content || '',
        coverImage: coverImage || null,
        category: category || 'general',
        isPublished: isPublished || false,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
