import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { rateLimitAsync, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function buildResetEmail(resetUrl: string): string {
  return `
    <div style="margin:0;padding:0;background:#f6fefb;font-family:Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d1fae5;border-radius:18px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 18px;background:linear-gradient(135deg,#059669,#0f766e);color:#ffffff;">
                  <h1 style="margin:0;font-size:26px;line-height:1.25;">SunuLogis</h1>
                  <p style="margin:8px 0 0;font-size:15px;opacity:.92;">Reinitialisation de votre mot de passe</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Vous avez demande a redefinir votre mot de passe SunuLogis.</p>
                  <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Ce lien est valable pendant 1 heure. Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet e-mail.</p>
                  <p style="margin:0 0 24px;text-align:center;">
                    <a href="${resetUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:14px 22px;font-size:15px;">
                      Reinitialiser mon mot de passe
                    </a>
                  </p>
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;word-break:break-all;">Si le bouton ne fonctionne pas, copiez ce lien : ${resetUrl}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt, 5);

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true },
    });

    const safeResponse = {
      success: true,
      message: 'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.',
    };

    if (!user || !user.isActive) {
      return NextResponse.json(safeResponse);
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration Resend manquante' }, { status: 500 });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await db.$transaction([
      db.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'SunuLogis <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reinitialisez votre mot de passe SunuLogis',
      html: buildResetEmail(resetUrl),
    });

    return NextResponse.json(safeResponse);
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
