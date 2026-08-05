import { NextResponse } from 'next/server';
import { auth } from '@darsa/auth';
import { prisma, RoleType } from '@darsa/database';

const DEFAULT_ACCOUNTS = [
  {
    email: 'sekretariat.pondok@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Pondok Pesantren',
    role: 'SEKRETARIAT' as RoleType,
    portal: '/loginpondok',
  },
  {
    email: 'sekretariat.madrasah@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Madrasah Diniyah',
    role: 'ADMIN_INSTANSI' as RoleType,
    portal: '/loginmadrasah',
  },
  {
    email: 'sekretariat.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Formal MI',
    role: 'ADMIN_INSTANSI' as RoleType,
    portal: '/loginmi',
  },
  {
    email: 'keamanan@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Tim Keamanan & Perizinan',
    role: 'KEAMANAN' as RoleType,
    portal: '/loginkeamanan',
  },
  {
    email: 'guru.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadzah Guru MI',
    role: 'GURU_MI' as RoleType,
    portal: '/logingurumi',
  },
  {
    email: 'mustahiq@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Mustahiq Diniyah',
    role: 'MUSTAHIQ' as RoleType,
    portal: '/login',
  },
  {
    email: 'munawwib@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Munawwib Diniyah',
    role: 'MUNAWWIB' as RoleType,
    portal: '/login',
  },
  {
    email: 'wali@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Wali Santri Lirboyo',
    role: 'WALI_SANTRI' as RoleType,
    portal: '/loginwali',
  },
];

export async function POST() {
  const results = [];

  for (const acc of DEFAULT_ACCOUNTS) {
    try {
      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (!existingUser) {
        // Create user via Better Auth
        await auth.api.signUpEmail({
          body: {
            email: acc.email,
            password: acc.password,
            name: acc.nama_lengkap,
          },
        });
      }

      // Ensure user has correct role in UserRole relation or User metadata
      const user = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (user) {
        // Upsert role relation
        let roleObj = await prisma.role.findFirst({
          where: { name: acc.role },
        });

        if (!roleObj) {
          roleObj = await prisma.role.create({
            data: {
              name: acc.role,
              description: `Role default ${acc.nama_lengkap}`,
            },
          });
        }

        const userRole = await prisma.userRole.findFirst({
          where: { user_id: user.id, role_id: roleObj.id },
        });

        if (!userRole) {
          await prisma.userRole.create({
            data: {
              user_id: user.id,
              role_id: roleObj.id,
            },
          });
        }

        results.push({ email: acc.email, status: 'CREATED_OR_VERIFIED', role: acc.role, portal: acc.portal });
      }
    } catch (err: any) {
      results.push({ email: acc.email, status: 'ERROR', message: err?.message || 'Gagal' });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Berhasil memverifikasi & membuat 8 akun default Darsa Enterprise di Database PostgreSQL.`,
    accounts: results,
  });
}

export async function GET() {
  return POST();
}
