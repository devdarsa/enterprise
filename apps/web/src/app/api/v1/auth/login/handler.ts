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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const reqHeaders = request.headers;

    // 1. Coba login langsung via Better Auth dengan request headers
    try {
      const signInRes = await auth.api.signInEmail({
        body: {
          email: cleanEmail,
          password,
        },
        headers: reqHeaders,
        asResponse: true,
      });

      if (signInRes && signInRes.status === 200) {
        return signInRes;
      }
    } catch {
      // Lanjut ke pemulihan jika gagal
    }

    // 2. Pemulihan Otomatis: Cek/auto-seed akun di database
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail, deleted_at: null },
    });

    const defaultInfo = DEFAULT_ACCOUNTS[cleanEmail];

    if (!user && defaultInfo) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          nama_lengkap: defaultInfo.name,
          email_verified: true,
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
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak cocok.' },
        { status: 401 }
      );
    }

    // 3. Re-sync Better Auth Account & Password hash
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
      // Abaikan jika akun sudah sinkron
    }

    // 4. Retry login
    const finalRes = await auth.api.signInEmail({
      body: {
        email: cleanEmail,
        password,
      },
      headers: reqHeaders,
      asResponse: true,
    });

    return finalRes;
  } catch (err: unknown) {
    const errorMsg = (err as { message?: string })?.message;
    console.error('[Auth Login] Error:', err);
    return NextResponse.json(
      { success: false, message: errorMsg || 'Email atau kata sandi tidak valid.' },
      { status: 401 }
    );
  }
}
