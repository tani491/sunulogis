import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { title, excerpt, content, coverImage, category, isPublished } = body;

    const post = await db.blogPost.update({
      where: { slug },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { slug } = await params;
    await db.blogPost.delete({ where: { slug } });

    return NextResponse.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
