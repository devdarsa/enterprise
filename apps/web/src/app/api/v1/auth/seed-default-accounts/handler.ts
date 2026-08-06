import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { auth } from '@darsa/auth';

const DEFAULT_ACCOUNTS = [
  {
    email: 'sekretariat.pondok@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Pondok Pesantren',
    role: 'SEKRETARIAT',
    portal: '/loginpondok',
  },
  {
    email: 'sekretariat.madrasah@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Madrasah Diniyah',
    role: 'ADMIN_INSTANSI',
    portal: '/loginmadrasah',
  },
  {
    email: 'sekretariat.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Formal MI',
    role: 'ADMIN_INSTANSI',
    portal: '/loginmi',
  },
  {
    email: 'keamanan@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Tim Keamanan & Perizinan',
    role: 'KEAMANAN',
    portal: '/loginkeamanan',
  },
  {
    email: 'guru.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadzah Guru MI',
    role: 'GURU_MI',
    portal: '/logingurumi',
  },
  {
    email: 'mustahiq@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Mustahiq Diniyah',
    role: 'MUSTAHIQ',
    portal: '/login',
  },
  {
    email: 'munawwib@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Munawwib Diniyah',
    role: 'MUNAWWIB',
    portal: '/login',
  },
  {
    email: 'wali@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Wali Santri Lirboyo',
    role: 'WALI_SANTRI',
    portal: '/loginwali',
  },
];

export async function POST() {
  const results = [];

  for (const acc of DEFAULT_ACCOUNTS) {
    try {
      // 1. Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (existingUser) {
        // Delete existing accounts and user to recreate with native Better Auth hashing
        await prisma.account.deleteMany({ where: { user_id: existingUser.id } });
        await prisma.user.delete({ where: { id: existingUser.id } });
      }

      // 2. Create User & Account via native Better Auth API (guarantees exact password hash format)
      await auth.api.signUpEmail({
        body: {
          email: acc.email,
          password: acc.password,
          name: acc.nama_lengkap,
        },
      });

      // Fetch created user
      const user = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (user) {
        // 3. Upsert Role in roles table using Direct SQL
        const targetRole = acc.role;
        let roleObj = await prisma.role.findFirst({
          where: { name: targetRole as any },
        });

        if (!roleObj) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO roles (id, name, description) VALUES (gen_random_uuid()::text, $1, $2) ON CONFLICT DO NOTHING`,
            targetRole,
            `Role default ${acc.nama_lengkap}`
          );
          roleObj = await prisma.role.findFirst({
            where: { name: targetRole as any },
          });
        }

        // 4. Link User and Role in user_roles junction table
        if (roleObj) {
          const existingUserRole = await prisma.userRole.findFirst({
            where: { user_id: user.id, role_id: roleObj.id },
          });

          if (!existingUserRole) {
            await prisma.userRole.create({
              data: {
                user_id: user.id,
                role_id: roleObj.id,
              },
            });
          }
        }
      }

      results.push({ email: acc.email, status: 'VERIFIED_AND_ACTIVE', role: acc.role, portal: acc.portal });
    } catch (err: any) {
      console.error(`Error seeding account ${acc.email}:`, err);
      results.push({ email: acc.email, status: 'ERROR', message: err?.message || 'Gagal' });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Berhasil memverifikasi & mengaktifkan 8 akun default Darsa Enterprise di Database PostgreSQL (Neon.tech).`,
    accounts: results,
  });
}

export async function GET() {
  return POST();
}
