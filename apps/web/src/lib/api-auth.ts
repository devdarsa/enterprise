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
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return null;
    return session as AuthSession;
  } catch {
    return null;
  }
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
