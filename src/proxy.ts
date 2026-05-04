import { NextRequest, NextResponse } from 'next/server';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// State-changing API routes that must originate from the same site.
// Defense-in-depth against CSRF on top of SameSite=Lax cookies.
const PROTECTED_API_PREFIX = '/api/';

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // CSRF protection for mutating API calls
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

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
