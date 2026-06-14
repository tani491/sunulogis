import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
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
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { title, excerpt, content, coverImage, category, isPublished } = body;

    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    const canEdit = isAdminRole(user.role) || (user.role === 'owner' && user.isSubscribed && existing.authorId === user.id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const post = await db.blogPost.update({
      where: { slug },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(isAdminRole(user.role) && isPublished !== undefined ? { isPublished } : {}),
        ...(user.role === 'owner' ? { isPublished: true } : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
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
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { slug } = await params;
    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    const canDelete = isAdminRole(user.role) || (user.role === 'owner' && user.isSubscribed && existing.authorId === user.id);
    if (!canDelete) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.blogPost.delete({ where: { slug } });

    return NextResponse.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
