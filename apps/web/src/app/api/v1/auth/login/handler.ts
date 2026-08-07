import { NextResponse } from 'next/server';
import { auth } from '@darsa/auth';
import { prisma } from '@darsa/database';

const DEFAULT_ACCOUNTS: Record<string, { role: string; name: string }> = {
  'sekretariat.pondok@darsa.my.id': { role: 'SEKRETARIAT', name: 'Sekretariat Pondok Pesantren' },
  'sekretariat.madrasah@darsa.my.id': { role: 'ADMIN_INSTANSI', name: 'Sekretariat Madrasah Diniyah' },
  'sekretariat.mi@darsa.my.id': { role: 'ADMIN_INSTANSI', name: 'Sekretariat Formal MI' },
  'keamanan@darsa.my.id': { role: 'KEAMANAN', name: 'Tim Keamanan & Perizinan' },
  'guru.mi@darsa.my.id': { role: 'GURU_MI', name: 'Ustadzah Guru MI' },
  'mustahiq@darsa.my.id': { role: 'MUSTAHIQ', name: 'Ustadz Mustahiq Diniyah' },
  'munawwib@darsa.my.id': { role: 'MUNAWWIB', name: 'Ustadz Munawwib Diniyah' },
  'wali@darsa.my.id': { role: 'WALI_SANTRI', name: 'Wali Santri Lirboyo' },
  'admin@darsa.id': { role: 'ADMIN_INSTANSI', name: 'Ustadz Ahmad Al-Farisi' },
  'guru@darsa.id': { role: 'GURU', name: 'Dr. KH. Abdullah Ridwan' },
  'santri@darsa.id': { role: 'SANTRI', name: 'Muhammad Raihan' },
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
    const reqHeaders = request.headers;
    const referer = reqHeaders.get('referer') || '';

    // Tentukan portal asal login
    let isPortalAdmin = bodyPortal === 'ADMIN' || referer.includes('/admin/login');
    let isPortalUmum = bodyPortal === 'UMUM' || (!isPortalAdmin && referer.includes('/login'));

    // 1. Cek User & Role di DB / Preset
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail, deleted_at: null },
      include: {
        user_roles: {
          include: { role: true },
        },
      },
    });

    const defaultInfo = DEFAULT_ACCOUNTS[cleanEmail];

    // Auto-seed akun jika preset
    if (!user && defaultInfo) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          nama_lengkap: defaultInfo.name,
          email_verified: true,
        },
        include: {
          user_roles: {
            include: { role: true },
          },
        },
      });

      const roleObj = await prisma.role.upsert({
        where: { name: defaultInfo.role as any },
        update: {},
        create: { name: defaultInfo.role as any, description: defaultInfo.name },
      });

      await prisma.userRole.upsert({
        where: { user_id_role_id: { user_id: user.id, role_id: roleObj.id } },
        update: {},
        create: { user_id: user.id, role_id: roleObj.id },
      });

      // Refetch user with roles
      user = await prisma.user.findFirst({
        where: { id: user.id },
        include: { user_roles: { include: { role: true } } },
      });
    }

    // Dapatkan role utama
    const userRole = user?.user_roles?.[0]?.role?.name || defaultInfo?.role || 'WALI_SANTRI';

    // 2. ENFORCE PORTAL SCOPE RULES (Ketentuan Resmi Login)
    // Rule A: Sekretariat / Admin dilarang login di portal umum (/login)
    if (isPortalUmum && SEKRETARIAT_ROLES.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: 'AKSES DITOLAK: Akun Kesekretariatan / Admin dilarang login melalui Portal Umum (/login). Silakan gunakan Portal Khusus Admin (/admin/login).',
        },
        { status: 403 }
      );
    }

    // Rule B: Wali Santri / Umum dilarang login di portal admin (/admin/login)
    if (isPortalAdmin && UMUM_ROLES.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: 'AKSES DITOLAK: Akun Wali Santri / Umum dilarang login melalui Portal Kesekretariatan Admin (/admin/login). Silakan gunakan Portal Umum (/login).',
        },
        { status: 403 }
      );
    }

    // 3. Re-sync Better Auth Account & Password hash jika perlu
    if (user) {
      try {
        await prisma.account.deleteMany({ where: { user_id: user.id } });
        await auth.api.signUpEmail({
          body: {
            email: cleanEmail,
            password: password,
            name: user.nama_lengkap || cleanEmail,
          },
        });
      } catch {
        // Abaikan jika sudah ada
      }
    }

    // 4. Exec Better Auth signInEmail
    const signInRes = await auth.api.signInEmail({
      body: {
        email: cleanEmail,
        password,
      },
      headers: reqHeaders,
      asResponse: true,
    });

    return signInRes;
  } catch (err: unknown) {
    const errorMsg = (err as { message?: string })?.message;
    console.error('[Auth Login] Error:', err);
    return NextResponse.json(
      { success: false, message: errorMsg || 'Email atau kata sandi tidak valid.' },
      { status: 401 }
    );
  }
}
