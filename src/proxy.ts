import { NextRequest, NextResponse } from 'next/server';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// State-changing API routes that must originate from the same site.
// Defense-in-depth against CSRF on top of SameSite=Lax cookies.
const PROTECTED_API_PREFIX = '/api/';

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (MUTATING_METHODS.has(method) && pathname.startsWith(PROTECTED_API_PREFIX)) {
    const requestOrigin = req.headers.get('origin');
    const requestHost = req.headers.get('host');

    if (requestOrigin) {
      try {
        const originHost = new URL(requestOrigin).host;
        if (requestHost && originHost !== requestHost) {
          return new NextResponse(
            JSON.stringify({ error: 'Requête cross-origin non autorisée' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: 'En-tête Origin invalide' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
