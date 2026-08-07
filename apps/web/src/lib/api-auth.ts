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

/**
 * Get session from a Next.js API route request.
 * Returns null if not authenticated.
 */
export async function getApiSession(request: NextRequest): Promise<AuthSession | null> {
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
      return authSession;
    }
  } catch {}

  // 2. Direct fallback to Prisma database session lookup
  try {
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ||
      request.cookies.get('__Secure-better-auth.session_token')?.value;

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

      if (dbSession?.user) {
        const userRole = dbSession.user.user_roles?.[0]?.role?.name || 'SEKRETARIAT';
        return {
          user: {
            id: dbSession.user.id,
            email: dbSession.user.email,
            name: dbSession.user.nama_lengkap || dbSession.user.email,
            role: userRole,
          },
        };
      }
    }
  } catch {}

  // 3. Fallback to darsa_session cookie if present
  try {
    const darsaSessionRaw = request.cookies.get('darsa_session')?.value;
    if (darsaSessionRaw) {
      const parsed = JSON.parse(decodeURIComponent(darsaSessionRaw));
      if (parsed?.id && parsed?.email) {
        return {
          user: {
            id: parsed.id,
            email: parsed.email,
            name: parsed.name || parsed.email,
            role: parsed.role || 'SEKRETARIAT',
          },
        };
      }
    }
  } catch {}

  return null;
}

/**
 * Get user's primary role from UserRole table via session.
 * Falls back to reading from session metadata.
 */
export type RouteContext = { params?: Promise<Record<string, string | string[]>> } | unknown;

export async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return null;
    const user = session.user as AuthSession['user'];
    return user.role || null;
  } catch {
    return null;
  }
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
 * Supports an optional context (route params) forwarded from dynamic routes.
 * Usage:
 *   export const GET = withAuth(handler, ['SEKRETARIAT', 'ADMIN_INSTANSI']);
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
 * Standard success response
 */
export function apiSuccess<T>(data: T, message?: string, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, message, meta });
}

/**
 * Standard error response
 */
export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

/**
 * Log an audit entry via the AuditLog table.
 */
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
    // Audit log failure should not break the main flow
    console.error('[AuditLog] Failed to write audit entry');
  }
}
