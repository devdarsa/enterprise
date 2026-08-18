import { auth } from '@darsa/auth';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

// In-Memory Fast Cache for Auth Sessions (TTL: 30s)
// Drastically cuts down PostgreSQL roundtrips from 3-4 per request down to 0 for warm requests!
const sessionCache = new Map<string, { session: AuthSession; expiresAt: number }>();

export async function authenticateRequest(request: NextRequest): Promise<{ authenticated: boolean; user?: AuthSession['user'] }> {
  const session = await getApiSession(request);
  if (!session?.user) {
    return { authenticated: false };
  }
  return { authenticated: true, user: session.user };
}

/**
 * Get session from a Next.js API route request with 30s High-Speed Memory Cache.
 * Returns null if not authenticated.
 */
export async function getApiSession(request: NextRequest): Promise<AuthSession | null> {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  const sessionToken =
    bearerToken ||
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('darsa_session')?.value;

  if (sessionToken) {
    const cached = sessionCache.get(sessionToken);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.session;
    }
  }

  // 1. Better-Auth session lookup
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (session?.user) {
      const authSession = session as AuthSession;
      if (!authSession.user.role) {
        const { prisma } = await import('@darsa/database');
        const userRole = await prisma.userRole.findFirst({
          where: { user_id: authSession.user.id },
          include: { role: true },
        });
        if (userRole) {
          authSession.user.role = userRole.role.name;
        }
      }

      if (sessionToken) {
        sessionCache.set(sessionToken, { session: authSession, expiresAt: Date.now() + 30_000 });
      }
      return authSession;
    }
  } catch {}

  // 2. Direct database session lookup (via Cookie or Bearer Header)
  try {
    if (sessionToken) {
      const { prisma } = await import('@darsa/database');
      const dbSession = await prisma.session.findFirst({
        where: { token: sessionToken, expires_at: { gt: new Date() } },
        include: {
          user: {
            include: {
              user_roles: { include: { role: true } },
            },
          },
        },
      });

      if (dbSession?.user && !dbSession.user.deleted_at) {
        const userRole = dbSession.user.user_roles?.[0]?.role?.name || 'SEKRETARIAT';
        const authSession: AuthSession = {
          user: {
            id: dbSession.user.id,
            email: dbSession.user.email,
            name: dbSession.user.nama_lengkap || dbSession.user.email,
            role: userRole,
          },
        };

        sessionCache.set(sessionToken, { session: authSession, expiresAt: Date.now() + 30_000 });
        return authSession;
      }
    }
  } catch {}

  return null;
}

export type RouteContext = { params?: Promise<Record<string, string | string[]>> } | unknown;

export async function getUserRole(request: NextRequest): Promise<string | null> {
  const session = await getApiSession(request);
  return session?.user?.role || null;
}

const ROLE_HIERARCHY: Record<string, number> = {
  SEKRETARIAT: 100,
  ADMIN_INSTANSI: 90,
  KEAMANAN: 60,
  GURU_MADRASAH: 50,
  GURU_MI: 50,
  GURU: 50,
  MUSTAHIQ: 50,
  MUNAWWIB: 50,
  PEGAWAI: 40,
  WALI_SANTRI: 30,
  SANTRI: 20,
};

/**
 * Higher-order function: wraps an API handler with auth + role check.
 */
export function withAuth(
  handler: (req: NextRequest, session: AuthSession, context?: RouteContext) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest, context?: RouteContext): Promise<NextResponse> => {
    const session = await getApiSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = session.user.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.' },
          { status: 403 }
        );
      }
    }

    return handler(req, session, context);
  };
}

/**
 * High-performance success response with optional HTTP SWR caching headers
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
  cacheSeconds = 0
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cacheSeconds > 0) {
    headers['Cache-Control'] = `private, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`;
  }

  return NextResponse.json({ success: true, data, message, meta }, { headers });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export async function logAudit(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  try {
    const { prisma } = await import('@darsa/database');
    await prisma.auditLog.create({
      data: {
        user_id: params.userId || null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ip_address: params.ip || null,
        user_agent: params.userAgent || null,
      },
    });
  } catch {
    console.error('[AuditLog] Failed to write audit entry');
  }
}
