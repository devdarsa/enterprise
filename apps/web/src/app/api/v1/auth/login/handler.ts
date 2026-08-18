import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { auth } from '@darsa/auth';
import crypto from 'crypto';

const DEFAULT_ACCOUNTS: Record<string, { role: string; name: string; defaultPass?: string }> = {
  'sekretariat.pondok@darsa.my.id': { role: 'SEKRETARIAT', name: 'Sekretariat Pondok Pesantren', defaultPass: 'darsa25' },
  'sekretariat.madrasah@darsa.my.id': { role: 'ADMIN_INSTANSI', name: 'Sekretariat Madrasah Diniyah', defaultPass: 'darsa25' },
  'sekretariat.mi@darsa.my.id': { role: 'ADMIN_INSTANSI', name: 'Sekretariat Formal MI', defaultPass: 'darsa25' },
  'keamanan@darsa.my.id': { role: 'KEAMANAN', name: 'Tim Keamanan & Perizinan', defaultPass: 'darsa25' },
  'guru.mi@darsa.my.id': { role: 'GURU_MI', name: 'Ustadzah Guru MI', defaultPass: 'darsa25' },
  'mustahiq@darsa.my.id': { role: 'MUSTAHIQ', name: 'Ustadz Mustahiq Diniyah', defaultPass: 'darsa25' },
  'munawwib@darsa.my.id': { role: 'MUNAWWIB', name: 'Ustadz Munawwib Diniyah', defaultPass: 'darsa25' },
  'wali@darsa.my.id': { role: 'WALI_SANTRI', name: 'Wali Santri Lirboyo', defaultPass: 'darsa25' },
  'admin@darsa.id': { role: 'ADMIN_INSTANSI', name: 'Ustadz Ahmad Al-Farisi', defaultPass: 'darsa25' },
  'guru@darsa.id': { role: 'GURU', name: 'Dr. KH. Abdullah Ridwan', defaultPass: 'darsa25' },
  'santri@darsa.id': { role: 'SANTRI', name: 'Muhammad Raihan', defaultPass: 'darsa25' },
};

const SEKRETARIAT_ROLES = ['SEKRETARIAT', 'ADMIN_INSTANSI', 'SUPERADMIN', 'PENGURUS', 'KEAMANAN'];
const UMUM_ROLES = ['WALI_SANTRI', 'SANTRI', 'ALUMNI'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, portal: bodyPortal } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();
    const reqHeaders = request.headers;
    const referer = reqHeaders.get('referer') || '';

    // Tentukan portal asal login
    const isPortalAdmin = bodyPortal === 'ADMIN' || referer.includes('/admin/login');
    const isPortalUmum = bodyPortal === 'UMUM' || (!isPortalAdmin && referer.includes('/login'));

    // 1. Coba Autentikasi Kredensial via Better Auth API
    let authenticatedUser: { id: string; email: string; name?: string } | null = null;
    let authError: string | null = null;

    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: cleanEmail,
          password: cleanPassword,
        },
      });
      if (signInResult?.user) {
        authenticatedUser = signInResult.user;
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      authError = errObj?.message || 'Kredensial tidak valid';
    }

    // 2. Fallback untuk Akun Terdaftar & Akun Default
    const defaultInfo = DEFAULT_ACCOUNTS[cleanEmail];
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail, deleted_at: null },
      include: {
        user_roles: {
          include: { role: true },
        },
      },
    });

    if (!authenticatedUser) {
      // Periksa kecocokan default password untuk akun sistem
      const isValidDefaultPass = defaultInfo && cleanPassword === (defaultInfo.defaultPass || 'darsa25');

      if (isValidDefaultPass) {
        if (!user) {
          // Auto-seed akun di database jika belum ada
          const roleName = defaultInfo.role;
          const name = defaultInfo.name;

          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              nama_lengkap: name,
              email_verified: true,
            },
            include: {
              user_roles: {
                include: { role: true },
              },
            },
          });

          const roleObj = await prisma.role.upsert({
            where: { name: roleName as any },
            update: {},
            create: { name: roleName as any, description: name },
          });

          await prisma.userRole.upsert({
            where: { user_id_role_id: { user_id: user.id, role_id: roleObj.id } },
            update: {},
            create: { user_id: user.id, role_id: roleObj.id },
          });

          user = await prisma.user.findFirst({
            where: { id: user.id },
            include: { user_roles: { include: { role: true } } },
          });
        }
      } else {
        // Password salah / tidak terautentikasi
        return NextResponse.json(
          { success: false, message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.' },
          { status: 401 }
        );
      }
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: cleanEmail, deleted_at: null },
        include: { user_roles: { include: { role: true } } },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak valid.' },
        { status: 401 }
      );
    }

    // Dapatkan role utama
    const userRole = user.user_roles?.[0]?.role?.name || defaultInfo?.role || 'SEKRETARIAT';

    // 3. ENFORCE PORTAL SCOPE RULES (Ketentuan Resmi Login)
    if (isPortalUmum && SEKRETARIAT_ROLES.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: 'AKSES DITOLAK: Akun Kesekretariatan / Admin dilarang login melalui Portal Umum.',
        },
        { status: 403 }
      );
    }

    if (isPortalAdmin && UMUM_ROLES.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: 'AKSES DITOLAK: Akun Wali Santri / Umum dilarang login melalui Portal Kesekretariatan Admin. Silakan gunakan Portal Umum.',
        },
        { status: 403 }
      );
    }

    // Determine instansi scope
    let instansi = 'PONDOK';
    if (cleanEmail.includes('madrasah')) instansi = 'MADRASAH';
    if (cleanEmail.includes('.mi') || cleanEmail.includes('mi@')) instansi = 'MI';

    // 4. Buat Session Token di Database
    const sessionToken = `darsa_sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Hari

    await prisma.session.create({
      data: {
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt,
        ip_address: reqHeaders.get('x-forwarded-for') || '127.0.0.1',
        user_agent: reqHeaders.get('user-agent') || 'DarsaApp',
      },
    });

    // 5. Buat Response Kuki Sesi Lengkap
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.nama_lengkap,
      role: userRole,
      instansi,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      token: sessionToken,
      message: `Login Berhasil sebagai ${user.nama_lengkap} (${userRole})`,
    });

    const isHttps = request.url.startsWith('https://') || reqHeaders.get('x-forwarded-proto') === 'https' || process.env.NODE_ENV === 'production';
    const cookieOptions = `Path=/; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
    const secureCookieOptions = `Path=/; SameSite=Lax; Secure; Max-Age=${30 * 24 * 3600}`;

    response.headers.append('Set-Cookie', `better-auth.session_token=${sessionToken}; ${cookieOptions}`);
    response.headers.append('Set-Cookie', `__Secure-better-auth.session_token=${sessionToken}; ${isHttps ? secureCookieOptions : cookieOptions}`);
    response.headers.append('Set-Cookie', `darsa_session=${encodeURIComponent(JSON.stringify(sessionData))}; ${cookieOptions}`);
    response.headers.append('Set-Cookie', `darsa_instansi=${instansi}; ${cookieOptions}`);

    return response;
  } catch (err: unknown) {
    const errorMsg = (err as { message?: string })?.message;
    console.error('[Auth Login] Error:', err);
    return NextResponse.json(
      { success: false, message: errorMsg || 'Email atau kata sandi tidak valid.' },
      { status: 500 }
    );
  }
}
